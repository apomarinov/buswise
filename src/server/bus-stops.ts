import { type BusStop as PrismaBusStop, type Prisma } from "@prisma/client";
import { db } from "app/server/db";
import { z } from "zod";

const schema = z
  .object({
    id: z.coerce.number().min(1),
    name: z.string().min(3),
    description: z.string().min(3),
    latitude: z.number(),
    longitude: z.number(),
  })
  .strict();

export type BusStop = z.infer<typeof schema>;

const toBusStop = (model: PrismaBusStop): BusStop => {
  return {
    id: model.id,
    name: model.name,
    description: model.description,
    latitude: parseFloat(model.latitude.toString()),
    longitude: parseFloat(model.longitude.toString()),
  };
};

const create = async (busStop: BusStop): Promise<BusStop> => {
  return toBusStop(
    await db.busStop.create({
      data: busStop,
    }),
  );
};

const update = async (busStop: BusStop): Promise<BusStop> => {
  return toBusStop(
    await db.busStop.update({
      where: { id: busStop.id },
      data: busStop,
    }),
  );
};

type BusStopQuery = {
  name?: string;
};

const getList = async (q: BusStopQuery): Promise<BusStop[]> => {
  const where: Prisma.BusStopWhereInput = {};
  if (q.name) {
    where.name = {
      contains: q.name,
    };
  }
  return (await db.busStop.findMany({ where, orderBy: { id: "desc" } })).map(
    (b) => toBusStop(b),
  );
};

const getById = async (id: number): Promise<BusStop | null> => {
  return toBusStop(await db.busStop.findUniqueOrThrow({ where: { id } }));
};

const deleteById = async (id: number): Promise<void> => {
  // TODO: handle dependencies
  await db.busStop.delete({ where: { id } });
};

const exports = {
  schema,
  create,
  update,
  getList,
  getById,
  deleteById,
};

export default exports;
