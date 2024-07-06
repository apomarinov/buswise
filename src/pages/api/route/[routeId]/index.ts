import { handler } from "app/server/handler";
import response from "app/server/response";
import routes, { type Route } from "app/server/routes";
import validate from "app/server/validate";
import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";

export default handler(async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "PUT") {
    const payload: object = {
      id: req.query.routeId,
      ...req.body,
    };
    const data = validate<Route>(payload, routes.schema);
    const route = await routes.update(data);
    response.success(res, route);
    return;
  }

  if (req.method === "DELETE") {
    const id = z.coerce.number().parse(req.query.routeId);
    const route = await routes.deleteById(id);
    response.success(res, route);
    return;
  }

  res.status(405).end();
});
