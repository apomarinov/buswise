import BusStopIcon from "app/components/Icons/BusStopIcon";
import Start from "app/components/Icons/Start";
import cn from "classnames";
import { type LatLngLiteral } from "google-maps-react-markers";
import moment from "moment";
import React from "react";

export type MarkerBusStopProps = {
  draggable?: boolean;
  lat: number;
  lng: number;
  isFirstStopInRoute: boolean;
  isSelected: boolean;
  color?: string;
  onClick?: (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => void;
  onDrag?: (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    props: { latLng: LatLngLiteral },
  ) => void;
  onDragEnd?: (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    props: { latLng: LatLngLiteral },
  ) => void;
  onDragStart?: (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    props: { latLng: LatLngLiteral },
  ) => void;
  onHover?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  onStopHover?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  distance?: number;
  travelTime?: number;
  stopName: string;
};

const MarkerBusStop: React.FC<MarkerBusStopProps> = ({
  onClick,
  isSelected,
  isFirstStopInRoute,
  color,
  distance,
  travelTime,
  stopName,
  onHover,
  onStopHover,
}) => {
  const travelTimeText = moment()
    .from(moment().subtract(travelTime, "seconds"))
    .replace("in", isFirstStopInRoute ? "Travel Time: " : "+")
    .replace(" time.", "")
    .replace(" minutes", "min")
    .replace(" hours", "h")
    .replace(" days", "d");

  let distanceText;
  if (distance) {
    distanceText =
      (isFirstStopInRoute ? "Distance: " : "+ ") +
      (distance >= 1000 ? (distance / 1000).toFixed(1) + "km" : distance + "m");
  }

  return (
    <div
      onMouseEnter={onHover}
      onMouseLeave={onStopHover}
      className={cn(
        "translate-y-[-40%] cursor-pointer rounded-full hover:bg-white p-1 relative",
        isSelected && "bg-white bg-opacity-80",
        isFirstStopInRoute && "translate-x-[20%] translate-y-[-24%] !p-2",
      )}
    >
      {isFirstStopInRoute ? (
        <Start onClick={onClick} color={color ?? "#525252FF"} />
      ) : (
        <BusStopIcon onClick={onClick} size={2.5} color={color} />
      )}
      {travelTime !== undefined && travelTime > 0 && (
        <div className="absolute -bottom-11 flex flex-col gap-0 bg-white p-0.5 rounded-md drop-shadow-sm justify-start px-1">
          <span className="whitespace-nowrap font-semibold w-full text-center mb-0.5">
            {stopName}
          </span>
          <span className="whitespace-nowrap">{travelTimeText}</span>
          <span className="whitespace-nowrap">{distanceText}</span>
        </div>
      )}
    </div>
  );
};

export default MarkerBusStop;
