import {
  type Prisma,
  type BusStop as PrismaBusStop,
  type PrismaClient,
  type RouteBusStop,
} from "@prisma/client";
import busStops, { type BusStop } from "app/server/bus-stops";
import { db } from "app/server/db";
import googleRoutes from "app/server/external/google-routes";
import { z } from "zod";

const schema = z
  .object({
    id: z.coerce.number().min(1),
    name: z.string().min(3),
  })
  .strict();

export type Route = z.infer<typeof schema>;

export type RouteBusStopWithData = RouteBusStop & {
  geoPoints: number[][];
  busStop: BusStop;
};

export type RouteWithData = Route & {
  routeBusStops: RouteBusStopWithData[];
  history?: {
    routeId: number;
    data: RouteBusStopWithData[];
  };
};

const create = async (route: Route): Promise<Route> => {
  return db.route.create({
    data: route,
  });
};

const update = async (route: Route): Promise<Route> => {
  return db.route.update({
    where: { id: route.id },
    data: route,
  });
};

const getList = async (): Promise<RouteWithData[]> => {
  const routes = await db.route.findMany({
    include: {
      routeBusStops: { include: { busStop: true }, orderBy: { order: "asc" } },
      history: true,
    },
    orderBy: { id: "desc" },
  });
  return routes as unknown as RouteWithData[];
};

const getById = async (id: number): Promise<Route | null> => {
  return db.route.findUniqueOrThrow({ where: { id } });
};

const deleteById = async (id: number): Promise<void> => {
  await db.routeBusStop.deleteMany({ where: { routeId: id } });
  await db.route.delete({ where: { id } });
};

const schemaRouteBusStopQuery = z.object({
  routeId: z.coerce.number().min(1),
  busStopId: z.coerce.number().min(1),
});

export type RouteBusStopQuery = z.infer<typeof schemaRouteBusStopQuery>;

const addBusStop = async (data: RouteBusStopQuery): Promise<RouteBusStop> => {
  const route = await db.route.findUniqueOrThrow({
    where: { id: data.routeId },
    include: { routeBusStops: { orderBy: { order: "asc" } } },
  });
  const newBusStop = await busStops.getById(data.busStopId);
  const existing = route.routeBusStops.find(
    (busStop) => busStop.busStopId == newBusStop.id,
  );
  if (existing) {
    throw new Error("Bus stop already added to route");
  }
  await saveHistory(route.id);

  const newRouteBusStop: Prisma.RouteBusStopUncheckedCreateInput = {
    routeId: data.routeId,
    busStopId: newBusStop.id,
    order: route.routeBusStops.length + 1,
  };
  const lastRouteBusStop = route.routeBusStops.slice(-1).pop();
  if (lastRouteBusStop) {
    const lastBusStop = await busStops.getById(lastRouteBusStop.busStopId);
    const routeInfo = await googleRoutes.getRoute(lastBusStop, newBusStop);
    newRouteBusStop.distance = routeInfo.distance;
    newRouteBusStop.travelTime = routeInfo.travelTime;
    newRouteBusStop.geoPoints = routeInfo.geoPoints;
  }

  return db.routeBusStop.create({
    data: newRouteBusStop,
  });
};

type PrismaTransactionalClient = Parameters<
  Parameters<PrismaClient["$transaction"]>[0]
>[0];

const recalculateBusStopData = async (
  routeId: number,
  tx: PrismaTransactionalClient,
): Promise<void> => {
  const route = await tx.route.findUniqueOrThrow({
    where: { id: routeId },
    include: { routeBusStops: { include: { busStop: true } } },
  });
  if (!route.routeBusStops.length) {
    return;
  }

  const firstRouteBusStop = route.routeBusStops[0];
  const deletedFirst = (firstRouteBusStop?.order ?? 0) > 1;
  if (deletedFirst && firstRouteBusStop) {
    await tx.routeBusStop.update({
      where: { id: firstRouteBusStop.id },
      data: {
        order: 1,
        distance: null,
        travelTime: null,
        geoPoints: undefined,
      },
    });
    return;
  }

  // intermediate bus stop deleted
  for (let i = 0; i < route.routeBusStops.length; i++) {
    const current = route.routeBusStops[i];
    const next = route.routeBusStops[i + 1];
    if (next && current && next.order - current.order > 1) {
      const routeInfo = await googleRoutes.getRoute(
        busStops.toBusStop(current.busStop),
        busStops.toBusStop(next.busStop),
      );
      await tx.routeBusStop.update({
        where: { id: next.id },
        data: {
          order: current.order + 1,
          distance: routeInfo.distance,
          travelTime: routeInfo.travelTime,
          geoPoints: routeInfo.geoPoints,
        },
      });
      return;
    }
  }
};

const removeBusStop = async (data: RouteBusStopQuery): Promise<void> => {
  await db.$transaction(async (tx) => {
    await saveHistory(data.routeId);
    const routeBusStop = await tx.routeBusStop.findFirstOrThrow({
      where: { routeId: data.routeId, busStopId: data.busStopId },
    });
    await tx.routeBusStop.delete({ where: { id: routeBusStop.id } });
    await recalculateBusStopData(data.routeId, tx);
  });
};

const updateBusStopRoute = async (
  routeBusStopId: number,
  from: PrismaBusStop,
  to: PrismaBusStop,
): Promise<void> => {
  const routeInfo = await googleRoutes.getRoute(
    busStops.toBusStop(from),
    busStops.toBusStop(to),
  );
  await db.routeBusStop.update({
    where: { id: routeBusStopId },
    data: {
      distance: routeInfo.distance,
      travelTime: routeInfo.travelTime,
      geoPoints: routeInfo.geoPoints,
    },
  });
};

const schemaReorderBusStops = z.object({
  routeId: z.coerce.number().min(1),
  from: z.number().min(1),
  to: z.number().min(1),
});

export type ReorderBusStops = z.infer<typeof schemaReorderBusStops>;

const reorderBusStop = async (data: ReorderBusStops): Promise<void> => {
  if (data.from === data.to) {
    throw new Error("New order cannot be the same");
  }

  const route = await db.route.findUniqueOrThrow({
    where: { id: data.routeId },
    include: {
      routeBusStops: { include: { busStop: true }, orderBy: { order: "asc" } },
    },
  });

  // get bus stops to switch
  let fromBusStop;
  let toBusStop;
  for (const busStop of route.routeBusStops) {
    if (busStop.order === data.to) {
      toBusStop = { ...busStop };
      toBusStop.order = data.from;
    }
    if (busStop.order === data.from) {
      fromBusStop = { ...busStop };
      fromBusStop.order = data.to;
    }
  }

  if (!fromBusStop || !toBusStop) {
    throw new Error("Invalid order provided");
  }

  // determine actions
  let toRemoveGeoFromId;
  let toUpdateGeo: (typeof fromBusStop)[] = [fromBusStop, toBusStop];

  if (data.from === 1) {
    toRemoveGeoFromId = toBusStop.id;
    toUpdateGeo = [fromBusStop];
  }
  if (data.to === 1) {
    toRemoveGeoFromId = fromBusStop.id;
    toUpdateGeo = [toBusStop];
  }

  // update order
  await db.routeBusStop.update({
    where: { id: fromBusStop.id },
    data: {
      order: data.to,
    },
  });
  await db.routeBusStop.update({
    where: { id: toBusStop.id },
    data: {
      order: data.from,
    },
  });

  // recalculate route info
  for (const updateBusStop of toUpdateGeo) {
    const previousStop = await db.routeBusStop.findFirstOrThrow({
      where: { routeId: data.routeId, order: updateBusStop.order - 1 },
      include: { busStop: true },
    });
    await updateBusStopRoute(
      updateBusStop.id,
      previousStop.busStop,
      updateBusStop.busStop,
    );
  }

  // update the new first bus stop
  if (toRemoveGeoFromId) {
    await db.routeBusStop.update({
      where: { id: toRemoveGeoFromId },
      data: {
        order: 1,
        distance: null,
        travelTime: null,
        geoPoints: [],
      },
    });
  }
};

const getByBusStopId = async (busStopId: number): Promise<Route[]> => {
  return (
    await db.routeBusStop.findMany({
      where: { busStopId },
      include: { route: true },
    })
  ).map((b) => b.route);
};

const saveHistory = async (id: number) => {
  const route = await db.route.findUniqueOrThrow({
    where: { id },
    include: {
      routeBusStops: {
        include: { busStop: true },
        orderBy: { order: "asc" },
      },
    },
  });
  await db.routeHistory.upsert({
    where: { routeId: route.id },
    create: {
      routeId: route.id,
      data: route.routeBusStops,
    },
    update: {
      routeId: route.id,
      data: route.routeBusStops,
    },
  });
};

const recalculateMovedBusStopRoute = async (
  busStopId: number,
): Promise<void> => {
  const routes = await db.route.findMany({
    where: {
      routeBusStops: { some: { busStopId } },
    },
    include: {
      routeBusStops: { include: { busStop: true }, orderBy: { order: "asc" } },
    },
  });

  let updatedRoutes: typeof routes = [];
  for (const route of routes) {
    for (let j = 0; j < route.routeBusStops.length; j++) {
      const moved = route.routeBusStops[j]!;
      if (moved.busStopId === busStopId) {
        updatedRoutes.push(route);
        if (j > 0) {
          const previous = route.routeBusStops[j - 1]!;
          await updateBusStopRoute(moved.id, previous.busStop, moved.busStop);
        }
        if (j < route.routeBusStops.length - 1) {
          const next = route.routeBusStops[j + 1]!;
          await updateBusStopRoute(next.id, moved.busStop, next.busStop);
        }
      }
    }
  }

  updatedRoutes = [...new Set(updatedRoutes)];
  for (const route of updatedRoutes) {
    await db.routeHistory.upsert({
      where: { routeId: route.id },
      create: {
        routeId: route.id,
        data: route.routeBusStops,
      },
      update: {
        routeId: route.id,
        data: route.routeBusStops,
      },
    });
  }
};

const exports = {
  schema,
  schemaRouteBusStopQuery,
  schemaReorderBusStops,
  create,
  update,
  getList,
  getById,
  deleteById,
  addBusStop,
  removeBusStop,
  reorderBusStop,
  getByBusStopId,
  recalculateMovedBusStopRoute,
  saveHistory,
};

export default exports;
