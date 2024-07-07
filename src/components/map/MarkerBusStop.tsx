import BusStopIcon from "app/components/Icons/BusStopIcon";
import Start from "app/components/Icons/Start";
import cn from "classnames";
import { type LatLngLiteral } from "google-maps-react-markers";
import React from "react";

export type MarkerBusStopProps = {
  draggable?: boolean;
  lat: number;
  lng: number;
  isFirstStopInRoute: boolean;
  isSelected: boolean;
  onClick?: (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => void;
  onDrag?: (
    e: React.MouseEvent<HTMLImageElement, MouseEvent>,
    props: { latLng: LatLngLiteral },
  ) => void;
  onDragEnd?: (
    e: React.MouseEvent<HTMLImageElement, MouseEvent>,
    props: { latLng: LatLngLiteral },
  ) => void;
  onDragStart?: (
    e: React.MouseEvent<HTMLImageElement, MouseEvent>,
    props: { latLng: LatLngLiteral },
  ) => void;
};

const MarkerBusStop: React.FC<MarkerBusStopProps> = ({
  onClick,
  isSelected,
  isFirstStopInRoute,
}) => {
  return (
    <div
      className={cn(
        "translate-y-[-40%] cursor-pointer rounded-full hover:bg-white p-1",
        isSelected && "bg-white bg-opacity-80",
        isFirstStopInRoute && "translate-x-[20%] translate-y-[-24%] !p-2",
      )}
    >
      {isFirstStopInRoute ? (
        <Start onClick={onClick} color="#525252FF" />
      ) : (
        <BusStopIcon onClick={onClick} size={2.5} />
      )}
    </div>
  );
};

export default MarkerBusStop;
