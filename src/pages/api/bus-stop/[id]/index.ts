import busStops, { type BusStop } from "app/server/bus-stops";
import { db } from "app/server/db";
import { handler } from "app/server/handler";
import response from "app/server/response";
import routes from "app/server/routes";
import validate from "app/server/validate";
import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";

export default handler(async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "PUT") {
    const payload: object = {
      id: req.query.id,
      ...req.body,
    };
    const data = validate<BusStop>(payload, busStops.schema);
    const busStop = await busStops.update(data);
    if (
      data.latitude !== busStop.latitude ||
      data.longitude !== busStop.longitude
    ) {
      await routes.recalculateMovedBusStopRoute(busStop.id);
    }
    response.success(res, busStop);
    return;
  }

  if (req.method === "GET") {
    const id = z.coerce.number().parse(req.query.id);
    const busStop = await busStops.getById(id);
    response.success(res, busStop);
    return;
  }

  if (req.method === "DELETE") {
    const id = z.coerce.number().parse(req.query.id);
    await db.routeBusStop.deleteMany({ where: { busStopId: id } });
    await busStops.deleteById(id);
    const routeList = await routes.getByBusStopId(id);
    for (const route of routeList) {
      await routes.saveHistory(route.id);
      await routes.recalculateBusStopData(route.id, db);
    }
    response.success(res);
    return;
  }

  res.status(405).end();
});
