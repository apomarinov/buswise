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
    for (const id of data.busStopIds) {
      await routes.removeBusStop({
        routeId: route.id,
        busStopId: id,
      });
    }
    response.success(res, route);
    return;
  }

  res.status(405).end();
});
