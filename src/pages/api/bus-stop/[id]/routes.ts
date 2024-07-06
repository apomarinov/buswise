import busStops from "app/server/bus-stops";
import { handler } from "app/server/handler";
import response from "app/server/response";
import routes from "app/server/routes";
import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";

export default handler(async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "GET") {
    const id = z.coerce.number().parse(req.query.id);
    await busStops.getById(id);
    const list = await routes.getByBusStopId(id);
    response.success(res, list);
    return;
  }

  res.status(405).end();
});
