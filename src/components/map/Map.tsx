import { Checkbox } from "@chakra-ui/react";
import MapUiConfirm, {
  type MapUiConfirmProps,
} from "app/components/map/MapUiConfirm";
import MarkerBusStop, {
  type MarkerBusStopProps,
} from "app/components/map/MarkerBusStop";
import MarkerCluster from "app/components/map/MarkerCluster";
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
import useSupercluster from "use-supercluster";

const mapOptions: MapOptions = {
  center: {
    lat: 33.96878271057514,
    lng: -118.16866256315598,
  },
  draggableCursor: "default",
  draggingCursor: "default",
  zoom: 9,
  minZoom: 9,
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
  const [showBusStops, setShowBusStops] = useState(true);
  const [showNonRouteBusStops, setShowNonRouteBusStops] = useState(false);
  const [mapConfirm, setMapConfirm] = useState<MapUiConfirmProps>();
  const [renderSeed, setRenderSeed] = useState(0);
  const [routePaths, setRoutePaths] = useState<google.maps.Polyline[]>([]);
  const [hoverBusStop, setHoverBusStop] = useState<BusStop>();
  const [hoverRoute, setHoverRoute] = useState<RouteWithData>();
  const [markers, setMarkers] = useState<any>([]);
  const [stopMap, setStopMap] = useState<any>({});
  const [mapBounds, setMapBounds] = useState({
    bounds: [0, 0, 0, 0],
    zoom: 0,
  });

  useEffect(() => {
    if (ui.mode === "routes") {
      setShowBusStops(true);
    }
  }, [ui.mode]);

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
      line.setOptions({ strokeWeight: activeStrokeSize, zIndex: 4 });
      setHoverRoute(route);
    });
    line.addListener("mouseout", () => {
      if (dataStore.selectedRouteIdx !== idx) {
        line.setOptions({ strokeWeight: 4 });
      }
      line.setOptions({ zIndex: 1 });
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
          colorFromString(route.name, 290),
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

  useEffect(() => {
    if (ui.mode === "routes" && dataStore.selectedRoute) {
      setShowNonRouteBusStops(true);
    }
  }, [dataStore.selectedRoute, ui.mode]);

  const onChangeBusStop = (e: any) => {
    map?.panTo({
      lat: parseFloat(e.detail.latitude),
      lng: parseFloat(e.detail.longitude),
    });
    map?.setZoom(15);
  };

  useEffect(() => {
    document.addEventListener("click-bus-stop", onChangeBusStop);
    return () => {
      document.removeEventListener("click-bus-stop", onChangeBusStop);
    };
  }, [map]);

  const onMapChange = ({ bounds, zoom }: any) => {
    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();

    setMapBounds({
      ...mapBounds,
      bounds: [sw.lng(), sw.lat(), ne.lng(), ne.lat()],
      zoom,
    });
  };

  useEffect(() => {
    if (!dataStore.busStops?.length) {
      return;
    }
    const newStopMap: any = {};
    const points = dataStore.busStops.map((busStop, idx) => {
      const showBusStop =
        !showNonRouteBusStops ||
        dataStore.busStopToRoute[busStop.id]?.[0] ===
          dataStore.selectedRoute?.name;
      if (!showBusStop) {
        return undefined;
      }
      newStopMap[busStop.id] = busStop;
      return {
        type: "Feature",
        properties: {
          cluster: false,
          busStopId: busStop.id,
          name: busStop.name,
          idx,
        },
        geometry: {
          type: "Point",
          coordinates: [busStop.longitude, busStop.latitude],
        },
      };
    });
    setStopMap(newStopMap);
    setMarkers(points.filter((b) => b));
  }, [dataStore.busStops, showNonRouteBusStops, dataStore.selectedRoute]);

  const { clusters, supercluster } = useSupercluster({
    points: markers,
    bounds: mapBounds.bounds,
    zoom: mapBounds.zoom,
    options: { radius: 95, maxZoom: 20 },
  });

  return (
    <div className="flex flex-grow flex-col max-sm:w-full">
      <div className="p-2 flex flex-col gap-2 items-end" id="ui-top-right">
        {ui.mode === "routes" && (
          <div className="flex justify-end">
            <div className="bg-white w-fit px-2 drop-shadow-md rounded-lg py-1 flex items-start flex-col gap-2 text-gray-700">
              <Checkbox
                isChecked={showBusStops}
                onChange={(e) => setShowBusStops(e.target.checked)}
              >
                <p className="!text-sm">Bus Stops</p>
              </Checkbox>
              {dataStore.selectedRoute && (
                <Checkbox
                  isChecked={showNonRouteBusStops}
                  onChange={(e) => setShowNonRouteBusStops(e.target.checked)}
                >
                  <p className="!text-sm">
                    Hide bus stops not in {`"${dataStore.selectedRoute.name}"`}
                  </p>
                </Checkbox>
              )}
            </div>
          </div>
        )}
        <div className="flex gap-2">
          {infoBusStop && (
            <div className="bg-white min-w-fit w-[140px] flex-grow drop-shadow-md rounded-lg p-2 flex items-center flex-col gap-2 text-[15px] text-gray-700">
              <div className="flex items-center flex-col w-full">
                <p className="font-semibold mb-0.5">{infoBusStop.name}</p>
                <p className="text-xs w-full text-center border-b-2 pb-1">
                  {infoBusStop.description}
                </p>
                <p className="text-xs mt-1">
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
            <div className="bg-white min-w-fit w-[140px] flex-grow drop-shadow-md rounded-lg p-2 flex items-center flex-col gap-2 text-[15px] text-gray-700">
              <p className="font-semibold border-b-2 pb-2 w-full text-center">
                {infoRoute.name}
              </p>
              <div className="w-full max-h-[300px] overflow-y-auto">
                <p className="text-xs text-right">
                  {infoRoute.routeBusStops?.length > 0
                    ? "Bus Stops:"
                    : "No Bus Stops"}
                </p>
                {infoRoute.routeBusStops.map((busStop, idx) => (
                  <div
                    key={busStop.busStop.name}
                    className="flex justify-between gap-4"
                  >
                    <span>{idx + 1}. </span>
                    <span>{busStop.busStop.name}</span>
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
        onChange={onMapChange}
      >
        {showBusStops &&
          clusters.map((cluster) => {
            const [longitude, latitude] = cluster.geometry.coordinates;
            const {
              cluster: isCluster,
              point_count: pointCount,
              busStopId,
              idx,
            } = cluster.properties;

            if (isCluster) {
              return (
                <MarkerCluster
                  key={`cluster-${cluster.id}`}
                  lat={latitude}
                  lng={longitude}
                  count={pointCount}
                  onClick={(e) => {
                    const expansionZoom = Math.min(
                      supercluster.getClusterExpansionZoom(cluster.id),
                      20,
                    );
                    map?.panTo({ lat: latitude, lng: longitude });
                    map?.setZoom(expansionZoom);
                  }}
                />
              );
            }

            const busStop = stopMap[busStopId];
            if (!busStop) {
              return <span key={busStopId}></span>;
            }

            let color;
            let busStopIdx;
            if (
              dataStore.selectedRoute &&
              dataStore.routeStopIds[dataStore.selectedRoute.id]?.includes(
                busStop.id,
              )
            ) {
              color = colorFromString(dataStore.selectedRoute?.name, 290);
              busStopIdx = dataStore.selectedRoute.routeBusStops.findIndex(
                (b) => b.busStopId === busStop.id,
              );
            }
            const isFirstStopInRoute =
              !!dataStore.routeFirstStops[busStop.id] &&
              (dataStore.routeFirstStops[busStop.id] ===
                dataStore.selectedRoute?.id ||
                !dataStore.selectedRoute) &&
              ui.mode === "routes";
            const metrics = dataStore.getBusStopMetrics(
              busStop.id,
              isFirstStopInRoute,
            );
            return (
              <MarkerBusStop
                idx={busStopIdx}
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
