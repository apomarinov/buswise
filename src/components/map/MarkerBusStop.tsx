import BusStopIcon from "app/components/Icons/BusStopIcon";
import cn from "classnames";
import { type LatLngLiteral } from "google-maps-react-markers";
import React from "react";

export type MarkerBusStopProps = {
  draggable?: boolean;
  lat: number;
  lng: number;
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
}) => {
  return (
    <div
      className={cn(
        "translate-y-[-40%] cursor-pointer rounded-full hover:bg-white p-1",
        isSelected && "bg-white bg-opacity-80",
      )}
    >
      <BusStopIcon onClick={onClick} size={2.5} />
    </div>
  );
};

export default MarkerBusStop;
