import polyline from "@mapbox/polyline";
import { env } from "app/env";

type LatLng = {
  latitude: number;
  longitude: number;
};

type RouteData = {
  distance: number;
  travelTime: number;
  geoPoints: number[][];
};

const getRoute = async (
  origin: LatLng,
  destination: LatLng,
): Promise<RouteData> => {
  const body = {
    origin: {
      location: {
        latLng: {
          latitude: origin.latitude,
          longitude: origin.longitude,
        },
      },
    },
    destination: {
      location: {
        latLng: {
          latitude: destination.latitude,
          longitude: destination.longitude,
        },
      },
    },
  };

  const response = await fetch(
    "https://routes.googleapis.com/directions/v2:computeRoutes",
    {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": env.GOOGLE_API_KEY,
        "X-Goog-FieldMask":
          "routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline",
      },
    },
  ).then((response: Response) => response.json());

  if (response.error || !response?.routes?.[0]) {
    console.error(response.error);
    throw new Error("Error processing route");
  }

  const data = response.routes[0];
  return {
    distance: data.distanceMeters,
    travelTime: parseInt(data.duration.replace("s", "")),
    geoPoints: polyline.decode(data.polyline.encodedPolyline),
  };
};

const exports = {
  getRoute,
};

export default exports;
