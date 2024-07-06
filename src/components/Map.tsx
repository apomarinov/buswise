import { Status, Wrapper } from "@googlemaps/react-wrapper";
import { useDataStore } from "app/contexts/DataStore";
import { env } from "app/env";
import React, { useEffect, useRef, useState } from "react";

type Props = {
  mode: "busStops" | "routes";
};

const Map: React.FC<Props> = ({ mode }) => {
  const dataStore = useDataStore();
  const ref = useRef<HTMLDivElement>(null);
  const [loadedApi, setLoadedApi] = useState(false);
  const [map, setMap] = useState<google.maps.Map>();

  useEffect(() => {
    if (!loadedApi || !ref.current) {
      return;
    }

    const newMap = new google.maps.Map(ref.current, {
      center: {
        lat: 35.669134862076554,
        lng: 139.7636375141335,
      },
      zoom: 14,
      minZoom: 10,
      fullscreenControl: false,
      streetViewControl: false,
      zoomControl: false,
      disableDoubleClickZoom: true,
      clickableIcons: false,
      gestureHandling: "greedy",
      mapId: "map",
      mapTypeControlOptions: {
        style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
      },
    });

    setMap(newMap);
  }, [loadedApi, ref.current]);

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

  return (
    <div className="flex flex-grow flex-col bg-blue-100 max-sm:w-full">
      <Wrapper
        apiKey={env.NEXT_PUBLIC_GOOGLE_API_KEY}
        libraries={["marker"]}
        render={(status) => {
          return (
            <div className="w-full h-full flex items-center justify-center">
              Loading
            </div>
          );
        }}
        callback={(status) => {
          if (status === Status.SUCCESS) {
            setLoadedApi(true);
          }
        }}
      >
        <div ref={ref} className="grow h-full w-full" id="map" />
      </Wrapper>
    </div>
  );
};

export default Map;