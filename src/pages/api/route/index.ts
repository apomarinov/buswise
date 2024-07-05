import { handler } from "app/server/handler";
import response from "app/server/response";
import routes, { type Route } from "app/server/routes";
import validate from "app/server/validate";
import type { NextApiRequest, NextApiResponse } from "next";

export default handler(async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    const data = validate<Route>(req.body, routes.schema.omit({ id: true }));
    const route = await routes.create(data);
    response.success(res, route);
    return;
  }

  if (req.method === "GET") {
    const list = await routes.getList();
    response.success(res, list);
    return;
  }

  res.status(405).end();
});
