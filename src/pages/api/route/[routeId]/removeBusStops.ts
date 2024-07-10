import { db } from "app/server/db";
import { handler } from "app/server/handler";
import response from "app/server/response";
import routes from "app/server/routes";
import validate from "app/server/validate";
import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";

export default handler(async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "DELETE") {
    const data = validate<{ routeId: number; busStopIds: number[] }>(
      {
        routeId: req.query.routeId,
        ...req.body,
      },
      z.object({ busStopIds: z.number().array(), routeId: z.coerce.number() }),
    );
    const route = await routes.getById(data.routeId);
    await routes.saveHistory(route.id);
    await db.routeBusStop.deleteMany({
      where: { routeId: route.id, busStopId: { in: data.busStopIds } },
    });
    await routes.recalculateBusStopData(route.id, db);
    response.success(res, route);
    return;
  }

  res.status(405).end();
});
