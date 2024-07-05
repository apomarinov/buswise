import { handler } from "app/server/handler";
import response from "app/server/response";
import routes, { type RouteBusStopQuery } from "app/server/routes";
import validate from "app/server/validate";
import type { NextApiRequest, NextApiResponse } from "next";

export default handler(async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    const payload: object = {
      routeId: req.query.routeId,
      ...req.body,
    };
    const data = validate<RouteBusStopQuery>(
      payload,
      routes.schemaRouteBusStopQuery,
    );
    const routeBusStop = await routes.addBusStop(data);
    response.success(res, routeBusStop);
    return;
  }

  if (req.method === "GET") {
    const list = await routes.getList();
    response.success(res, list);
    return;
  }

  res.status(405).end();
});
