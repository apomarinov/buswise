import busStops, { type BusStop } from "app/server/bus-stops";
import { handler } from "app/server/handler";
import response from "app/server/response";
import validate from "app/server/validate";
import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";

export default handler(async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    const data = validate<BusStop>(
      req.body,
      busStops.schema.omit({ id: true }),
    );
    const busStop = await busStops.create(data);
    response.success(res, busStop);
    return;
  }

  if (req.method === "GET") {
    const name = z.string().default("").parse(req.query.name);
    const list = await busStops.getList({ name });
    response.success(res, list);
    return;
  }

  res.status(405).end();
});
