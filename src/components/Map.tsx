import { Status, Wrapper } from "@googlemaps/react-wrapper";
import { env } from "app/env";
import React, { useEffect, useRef, useState } from "react";

const Map: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [loadedApi, setLoadedApi] = useState<boolean>(false);
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
      gestureHandling: "greedy",
      mapId: "map",
      mapTypeControlOptions: {
        style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
      },
    });

    setMap(newMap);
  }, [loadedApi, ref.current]);

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
