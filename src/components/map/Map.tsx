import MapUiConfirm, {
  type MapUiConfirmProps,
} from "app/components/map/MapUiConfirm";
import MarkerBusStop, {
  type MarkerBusStopProps,
} from "app/components/map/MarkerBusStop";
import { useDataStore } from "app/contexts/DataStore";
import { useUiController } from "app/contexts/UIController";
import { env } from "app/env";
import { colorFromString } from "app/helpers/string";
import { type BusStop } from "app/server/bus-stops";
import {
  type RouteBusStopWithData,
  type RouteWithData,
} from "app/server/routes";
import GoogleMap, {
  type LatLngLiteral,
  type MapOptions,
} from "google-maps-react-markers";
import React, { useEffect, useState } from "react";

const mapOptions: MapOptions = {
  center: {
    lat: 42.697059524078185,
    lng: 23.321707656774702,
  },
  draggableCursor: "default",
  draggingCursor: "default",
  zoom: 13,
  minZoom: 10,
  fullscreenControl: false,
  streetViewControl: false,
  zoomControl: false,
  disableDoubleClickZoom: true,
  clickableIcons: false,
  gestureHandling: "greedy",
  mapTypeControlOptions: {
    style: 2,
  },
  styles: [
    {
      featureType: "poi",
      elementType: "labels",
      stylers: [
        {
          visibility: "off",
        },
      ],
    },
    {
      featureType: "transit.station",
      stylers: [{ visibility: "off" }],
    },
    {
      featureType: "road",
      elementType: "labels",
      stylers: [{ visibility: "off" }],
    },
  ],
};

const Map: React.FC = () => {
  const dataStore = useDataStore();
  const ui = useUiController();
  const [map, setMap] = useState<google.maps.Map>();
  const [isDragging, setIsDragging] = useState(false);
  const [mapConfirm, setMapConfirm] = useState<MapUiConfirmProps>();
  const [renderSeed, setRenderSeed] = useState(0);
  const [routePaths, setRoutePaths] = useState<google.maps.Polyline[]>([]);
  const [hoverBusStop, setHoverBusStop] = useState<BusStop>();
  const [hoverRoute, setHoverRoute] = useState<RouteWithData>();

  useEffect(() => {
    if (!map) {
      return;
    }
    const listeners: google.maps.MapsEventListener[] = [];
    listeners.push(
      map.addListener("click", (e) => {
        dataStore.setBusStopForm({
          id: 0,
          name: "",
          description: "",
          latitude: e.latLng.lat(),
          longitude: e.latLng.lng(),
        });
      }),
    );
    return () => {
      listeners.forEach((l) => l?.remove());
    };
  }, [map]);

  const getPolylineFromRouteBusStops = (
    routeBusStops: RouteBusStopWithData[],
    idx: number,
    strokeColor: string,
    isHistory?: boolean,
    route?: RouteWithData,
  ) => {
    const path: { lat: number; lng: number }[] = [];
    routeBusStops.forEach((busStop) => {
      if (!busStop.geoPoints) {
        if (!isHistory) {
          path.push({
            lat: parseFloat(busStop.busStop.latitude.toString()),
            lng: parseFloat(busStop.busStop.longitude.toString()),
          });
        }
        return;
      }
      path.push(
        ...busStop.geoPoints?.map((point) => ({
          lat: point[0]!,
          lng: point[1]!,
        })),
      );
    });

    const activeStrokeSize = isHistory ? 11 : 7;
    const line = new google.maps.Polyline({
      path,
      map,
      geodesic: true,
      strokeColor,
      strokeOpacity: 1.0,
      strokeWeight: dataStore.selectedRouteIdx === idx ? activeStrokeSize : 4,
      zIndex: dataStore.selectedRouteIdx === idx ? 2 : 0,
    });
    line.addListener("mousemove", () => {
      line.setOptions({ strokeWeight: activeStrokeSize, zIndex: 2 });
      setHoverRoute(route);
    });
    line.addListener("mouseout", () => {
      if (dataStore.selectedRouteIdx !== idx) {
        line.setOptions({ strokeWeight: 4, zIndex: 0 });
      }
      setHoverRoute(undefined);
    });
    line.addListener("click", () => {
      line.setOptions({ strokeWeight: activeStrokeSize, zIndex: 1 });
      dataStore.setSelectedRouteIdx(idx);
    });

    return line;
  };

  useEffect(() => {
    if (!map) {
      return;
    }
    routePaths.forEach((p) => p.setMap(null));
    if (ui.mode !== "routes") {
      setRoutePaths([]);
      return;
    }
    const newPaths: google.maps.Polyline[] = [];
    dataStore.routes.forEach((route, idx) => {
      if (
        dataStore.showReportForRoute !== undefined &&
        dataStore.showReportForRoute !== route.id
      ) {
        return;
      }
      if (!dataStore.visibleRoutes.includes(idx)) {
        return;
      }

      if (dataStore.showReportForRoute === route.id && route.history) {
        newPaths.push(
          getPolylineFromRouteBusStops(
            route.history.data,
            idx,
            "rgba(232,102,102,1)",
            true,
            route,
          ),
        );
      }
      newPaths.push(
        getPolylineFromRouteBusStops(
          route.routeBusStops,
          idx,
          colorFromString(route.name),
          false,
          route,
        ),
      );
    });
    setRoutePaths(newPaths);
  }, [
    dataStore.routes,
    map,
    ui.mode,
    dataStore.selectedRouteIdx,
    dataStore.visibleRoutes,
    dataStore.showReportForRoute,
  ]);

  const onBusStopClick = (
    e: React.MouseEvent<SVGSVGElement, MouseEvent>,
    idx: number,
    busStop: BusStop,
  ) => {
    e.stopPropagation();
    setIsDragging((old) => {
      if (!old) {
        dataStore.setSelectedBusStopIdx(idx);
      }
      return false;
    });
  };

  const saveStop = (busStop: BusStop) => {
    void dataStore.updateBusStop(busStop).then((r) => {
      setMapConfirm(undefined);
      void dataStore.fetchRoutes();
    });
  };

  const onBusStopDrag: MarkerBusStopProps["onDrag"] = (e, { latLng }) => {
    if (!isDragging) {
      setIsDragging(true);
    }
  };

  const onBusStopDragEnd = (
    busStop: BusStop,
  ): MarkerBusStopProps["onDragEnd"] => {
    return (e, { latLng }) => {
      setIsDragging((old) => {
        if (old) {
          setMapConfirm({
            text: `Save "${busStop.name}" new location`,
            isLoading: false,
            actions: [
              {
                text: "Save",
                action: () =>
                  saveStop({
                    ...busStop,
                    latitude: latLng.lat,
                    longitude: latLng.lng,
                  }),
              },
            ],
            onCancel: () => {
              setRenderSeed((old) => old + 1);
              setMapConfirm(undefined);
            },
          });
        }
        return old;
      });
    };
  };

  useEffect(() => {
    if (dataStore.selectedBusStop === undefined || ui.mode !== "routes") {
      setMapConfirm(undefined);
      return;
    }

    const existsInRoute = dataStore.selectedRoute?.routeBusStops?.find(
      (b) => b.busStop.id === dataStore.selectedBusStop!.id,
    );
    if (existsInRoute) {
      setMapConfirm({
        isLoading: false,
        actions: [
          {
            text: "Remove From Route",
            action: () => {
              if (dataStore.selectedRoute?.id) {
                void dataStore
                  .removeBusStopFromRoute(
                    dataStore.selectedRoute.id,
                    dataStore.selectedBusStop!.id,
                  )
                  .then((r) => setMapConfirm(undefined));
              }
            },
          },
        ],
        onCancel: () => {
          setMapConfirm(undefined);
          dataStore.setSelectedBusStopIdx();
        },
      });
    } else if (dataStore.selectedRoute) {
      setMapConfirm({
        text: `Add stop "${dataStore.selectedBusStop.name}" to route "${dataStore.selectedRoute.name}"?`,
        isLoading: false,
        actions: [
          {
            text: "Add To Route",
            action: () => {
              if (dataStore.selectedRoute?.id) {
                void dataStore
                  .addBusStopToRoute(
                    dataStore.selectedRoute.id,
                    dataStore.selectedBusStop!.id,
                  )
                  .then((r) => setMapConfirm(undefined));
              }
            },
          },
          {
            text: "New Route",
            action: () => {
              dataStore.setRouteForm({ name: "" });
              setMapConfirm(undefined);
            },
          },
        ],
        onCancel: () => {
          setMapConfirm(undefined);
          dataStore.setSelectedBusStopIdx();
        },
      });
    } else {
      dataStore.setRouteForm({ name: "" });
    }
  }, [dataStore.selectedBusStop]);

  const infoBusStop = hoverBusStop ?? dataStore.selectedBusStop;
  const infoRoute = hoverRoute ?? dataStore.selectedRoute;

  return (
    <div className="flex flex-grow flex-col max-sm:w-full">
      <div className="p-2 flex flex-col gap-2 items-end" id="ui-top-right">
        <div className="flex gap-2">
          {infoBusStop && (
            <div className="bg-white w-fit drop-shadow-md rounded-lg p-2 flex items-center flex-col gap-2 text-[15px] text-gray-700">
              <p className="font-semibold">{infoBusStop.name}</p>
              <div>
                <p className="text-xs">
                  {dataStore.busStopToRoute[infoBusStop.id]?.length
                    ? "Used in routes"
                    : "Not used in routes"}
                </p>
                {dataStore.busStopToRoute[infoBusStop.id]?.map((route) => (
                  <div key={route} className="text-right">
                    {route}
                  </div>
                ))}
              </div>
            </div>
          )}
          {infoRoute && (
            <div className="bg-white w-fit drop-shadow-md rounded-lg p-2 flex items-center flex-col gap-2 text-[15px] text-gray-700">
              <p className="font-semibold">{infoRoute.name}</p>
              <div>
                <p className="text-xs">
                  {infoRoute.routeBusStops?.length > 0
                    ? "Bus Stops:"
                    : "No Bus Stops"}
                </p>
                {infoRoute.routeBusStops.map((busStop) => (
                  <div key={busStop.busStop.name} className="text-right">
                    {busStop.busStop.name}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        {mapConfirm && (
          <MapUiConfirm {...mapConfirm} isLoading={dataStore.isLoading} />
        )}
      </div>
      <GoogleMap
        apiKey={env.NEXT_PUBLIC_GOOGLE_API_KEY}
        defaultCenter={mapOptions.center as LatLngLiteral}
        defaultZoom={mapOptions.zoom!}
        options={mapOptions}
        mapMinHeight="100%"
        onGoogleApiLoaded={(props) => {
          setMap(props.map);
          props.map.controls[google.maps.ControlPosition.TOP_RIGHT]?.push(
            document.getElementById("ui-top-right")!,
          );
        }}
      >
        {dataStore.busStops.map((busStop, idx) => {
          let color;
          if (
            dataStore.selectedRoute &&
            dataStore.routeStopIds[dataStore.selectedRoute.id]?.includes(
              busStop.id,
            )
          ) {
            color = colorFromString(dataStore.selectedRoute?.name);
          }
          const isFirstStopInRoute =
            !!dataStore.routeFirstStops[busStop.id] && ui.mode === "routes";
          const metrics = dataStore.getBusStopMetrics(
            busStop.id,
            isFirstStopInRoute,
          );

          return (
            <MarkerBusStop
              onHover={() => setHoverBusStop(busStop)}
              onStopHover={() => setHoverBusStop(undefined)}
              stopName={busStop.name}
              distance={metrics.distance}
              travelTime={metrics.travelTime}
              key={idx + renderSeed}
              color={color}
              isFirstStopInRoute={isFirstStopInRoute}
              isSelected={dataStore.selectedBusStopIdx === idx}
              lat={busStop.latitude}
              lng={busStop.longitude}
              onClick={(e) => onBusStopClick(e, idx, busStop)} // you need to manage this prop on your Marker component!
              draggable
              onDrag={onBusStopDrag}
              onDragEnd={onBusStopDragEnd(busStop)}
            />
          );
        })}
      </GoogleMap>
    </div>
  );
};

export default Map;
