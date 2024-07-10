import { handler } from "app/server/handler";
import response from "app/server/response";
import routes, {
  type ReorderBusStops,
  type RouteBusStopQuery,
} from "app/server/routes";
import validate from "app/server/validate";
import type { NextApiRequest, NextApiResponse } from "next";

export default handler(async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "DELETE") {
    const payload: object = {
      routeId: req.query.routeId,
      busStopId: req.query.busStopId,
    };
    const data = validate<RouteBusStopQuery>(
      payload,
      routes.schemaRouteBusStopQuery,
    );
    await routes.saveHistory(data.routeId);
    await routes.removeBusStop(data);
    response.success(res);
    return;
  }

  if (req.method === "PUT") {
    const payload: object = {
      routeId: req.query.routeId,
      ...req.body,
    };
    const data = validate<ReorderBusStops>(
      payload,
      routes.schemaReorderBusStops,
    );
    await routes.reorderBusStop(data);
    response.success(res);
    return;
  }

  res.status(405).end();
});
