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
import { type RouteBusStopWithData } from "app/server/routes";
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
    showFirst?: boolean,
  ) => {
    const path: { lat: number; lng: number }[] = [];
    routeBusStops.forEach((busStop) => {
      if (!busStop.geoPoints) {
        if (showFirst) {
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

    const line = new google.maps.Polyline({
      path,
      map,
      geodesic: true,
      strokeColor,
      strokeOpacity: 1.0,
      strokeWeight: dataStore.selectedRouteIdx === idx ? 7 : 4,
      zIndex: dataStore.selectedRouteIdx === idx ? 2 : 0,
    });
    line.addListener("mousemove", () => {
      line.setOptions({ strokeWeight: 7, zIndex: 2 });
    });
    line.addListener("mouseout", () => {
      if (dataStore.selectedRouteIdx !== idx) {
        line.setOptions({ strokeWeight: 4, zIndex: 0 });
      }
    });
    line.addListener("click", () => {
      line.setOptions({ strokeWeight: 7, zIndex: 1 });
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
          getPolylineFromRouteBusStops(route.history.data, idx, "#ee5f5f"),
        );
      }
      newPaths.push(
        getPolylineFromRouteBusStops(
          route.routeBusStops,
          idx,
          colorFromString(route.name),
          true,
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
        if (ui.mode === "routes") {
          const existsInRoute = dataStore.selectedRoute?.routeBusStops?.find(
            (b) => b.busStop.id === busStop.id,
          );
          if (existsInRoute) {
            console.log("show info");
          } else if (dataStore.selectedRoute) {
            setMapConfirm({
              text: `Add stop "${busStop.name}" to route "${dataStore.selectedRoute.name}"?`,
              isLoading: false,
              onConfirm: () => {
                if (dataStore.selectedRoute?.id) {
                  void dataStore
                    .addBusStopToRoute(dataStore.selectedRoute.id, busStop.id)
                    .then((r) => setMapConfirm(undefined));
                }
              },
              onCancel: () => setMapConfirm(undefined),
            });
          } else {
            dataStore.setRouteForm({ name: "" });
          }
        }
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
            text: `Save "${busStop.name}" location`,
            isLoading: false,
            onConfirm: () =>
              saveStop({
                ...busStop,
                latitude: latLng.lat,
                longitude: latLng.lng,
              }),
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

  return (
    <div className="flex flex-grow flex-col max-sm:w-full">
      <div className="p-2 flex flex-col gap-2" id="ui-top-right">
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
        {dataStore.busStops.map((busStop, idx) => (
          <MarkerBusStop
            key={idx + renderSeed}
            isFirstStopInRoute={
              !!dataStore.routeFirstStops[busStop.id] && ui.mode === "routes"
            }
            isSelected={dataStore.selectedBusStopIdx === idx}
            lat={busStop.latitude}
            lng={busStop.longitude}
            onClick={(e) => onBusStopClick(e, idx, busStop)} // you need to manage this prop on your Marker component!
            draggable
            onDrag={onBusStopDrag}
            onDragEnd={onBusStopDragEnd(busStop)}
          />
        ))}
      </GoogleMap>
    </div>
  );
};

export default Map;
