import { Button } from "@chakra-ui/react";
import Close from "app/components/Icons/Close";
import MarkerBusStop, {
  type MarkerBusStopProps,
} from "app/components/map/MarkerBusStop";
import { useDataStore } from "app/contexts/DataStore";
import { env } from "app/env";
import { type BusStop } from "app/server/bus-stops";
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

type Props = {
  mode: "busStops" | "routes";
};

const Map: React.FC<Props> = ({ mode }) => {
  const dataStore = useDataStore();
  const [map, setMap] = useState<google.maps.Map>();
  const [isDragging, setIsDragging] = useState(false);
  const [updateBusStop, setUpdateBusStop] = useState<BusStop>();
  const [renderSeed, setRenderSeed] = useState(0);

  useEffect(() => {
    if (!map) {
      return;
    }
    const listeners: google.maps.MapsEventListener[] = [];
    listeners.push(
      map.addListener("click", (e) => {
        if (mode === "busStops") {
          dataStore.setBusStopForm({
            id: 0,
            name: "",
            description: "",
            latitude: e.latLng.lat(),
            longitude: e.latLng.lng(),
          });
        }
      }),
    );
    return () => {
      listeners.forEach((l) => l?.remove());
    };
  }, [map, mode]);

  const onBusStopClick = (e: MouseEvent, idx: number) => {
    e.stopPropagation();
    setIsDragging((old) => {
      if (!old) {
        dataStore.setSelectedBusStopIdx(idx);
      }
      return false;
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
          setUpdateBusStop({
            ...busStop,
            latitude: latLng.lat,
            longitude: latLng.lng,
          });
        }
        return old;
      });
    };
  };

  const saveStop = () => {
    void dataStore.updateBusStop(updateBusStop!).then((r) => {
      setUpdateBusStop(undefined);
    });
  };

  return (
    <div className="flex flex-grow flex-col bg-blue-100 max-sm:w-full">
      <div className="p-2 flex flex-col gap-2" id="ui-top-right">
        {updateBusStop && (
          <div>
            <Button
              size="sm"
              isLoading={dataStore.isLoading}
              colorScheme="blue"
              onClick={saveStop}
            >
              Save {`"${updateBusStop.name}"`} location
            </Button>
            <Button
              size="sm"
              isDisabled={dataStore.isLoading}
              className="ml-2 !p-0"
              onClick={() => {
                setRenderSeed((old) => old + 1);
                setUpdateBusStop(undefined);
              }}
            >
              <Close size={1} />
            </Button>
          </div>
        )}
      </div>
      <GoogleMap
        apiKey={env.NEXT_PUBLIC_GOOGLE_API_KEY}
        defaultCenter={mapOptions.center as LatLngLiteral}
        defaultZoom={mapOptions.zoom!}
        options={mapOptions}
        mapMinHeight="100vh"
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
            isSelected={dataStore.selectedBusStopIdx === idx}
            lat={busStop.latitude}
            lng={busStop.longitude}
            onClick={(e) => onBusStopClick(e, idx)} // you need to manage this prop on your Marker component!
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
