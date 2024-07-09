import { type BusStop, PrismaClient } from "@prisma/client";
import * as fs from "node:fs";

const deg2rad = (deg: number) => {
  return deg * (Math.PI / 180);
};

export const getDistanceInKm = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
) => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1); // deg2rad below
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  // Distance in km
  return R * c;
};

void (async () => {
  const db = new PrismaClient({
    log: ["query", "error", "warn"],
  });
  await db.route.deleteMany({});
  await db.busStop.deleteMany({});

  const data = JSON.parse(
    fs.readFileSync("./src/scripts/mock-data.json", "utf8"),
  );

  await db.busStop.createMany({
    data: data.map((busStop: any, idx: number) => ({
      name: `Stop ${idx + 1}`,
      description: `Description ${idx + 1}`,
      latitude: busStop.geometry.coordinates[1],
      longitude: busStop.geometry.coordinates[0],
    })),
  });

  let routes = 0;
  const busStops = await db.busStop.findMany({
    where: {},
  });
  const routeStops = busStops.slice(0, 4);
  const used: any = {};
  used[routeStops[0]!.id] = true;
  used[routeStops[1]!.id] = true;
  used[routeStops[2]!.id] = true;
  used[routeStops[3]!.id] = true;

  const getClosestTo = (
    lat: number,
    lng: number,
    usedArr: number[],
  ): BusStop => {
    const distances: any[] = [];
    busStops.forEach((busStop, idx) => {
      if (usedArr[busStop.id]) {
        return;
      }
      const val = getDistanceInKm(
        lat,
        lng,
        parseFloat(busStop.latitude.toString()),
        parseFloat(busStop.longitude.toString()),
      );
      distances.push([val, busStop]);
    });
    distances.sort((a, b) => a[0] - b[0]);
    return distances[0]?.[1];
  };

  let perRoute = 300;
  while (routes++ < 4) {
    perRoute = 300;
    const route = await db.route.upsert({
      where: { name: `Route ${routes}` },
      create: { name: `Route ${routes}` },
      update: { name: `Route ${routes}` },
    });
    let routeStartStop = routeStops[routes - 1];
    if (!routeStartStop) {
      continue;
    }
    await fetch(`http://localhost:3000/api/route/${route.id}/bus-stop`, {
      method: "POST",
      body: JSON.stringify({ busStopId: routeStartStop.id }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    while (perRoute--) {
      const closest = getClosestTo(
        parseFloat(routeStartStop.latitude.toString()),
        parseFloat(routeStartStop.longitude.toString()),
        used,
      );
      if (!closest) {
        break;
      }
      used[closest.id] = true;
      const res = await fetch(
        `http://localhost:3000/api/route/${route.id}/bus-stop`,
        {
          method: "POST",
          body: JSON.stringify({ busStopId: closest.id }),
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
      console.log((await res.json()).success, routes, Object.keys(used).length);
      routeStartStop = closest;
    }
  }
})();
