import { Button } from "@chakra-ui/react";
import Delete from "app/components/Icons/Delete";
import Reorder from "app/components/Icons/Reorder";
import { useDataStore } from "app/contexts/DataStore";
import { type RouteBusStopWithData } from "app/server/routes";
import cn from "classnames";
import React from "react";
import { useDrag, useDrop } from "react-dnd";

type Props = {
  idx: number;
  busStop: RouteBusStopWithData;
  onClick: () => void;
  onDragEnd: (busStopId: number, fromOrder: number, toOrder: number) => void;
};

const BusStopDraggable: React.FC<Props> = ({
  busStop,
  onDragEnd,
  idx,
  onClick,
}) => {
  const [{ opacity }, dragRef] = useDrag(
    () => ({
      type: "card",
      item: { id: busStop.busStopId, order: busStop.order },
      end: (item, monitor) => {
        const dropResult = monitor.getDropResult<{
          id: string;
          order: number;
        }>();
        if (item && dropResult && item.order !== dropResult.order) {
          onDragEnd(item.id, item.order, dropResult.order);
        }
      },
      collect: (monitor) => ({
        opacity: monitor.isDragging() ? 0.5 : 1,
      }),
    }),
    [],
  );

  const [collectedProps, drop] = useDrop(() => ({
    accept: "card",
    drop: () => ({ id: busStop.busStopId, order: busStop.order }),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }));

  const dataStore = useDataStore();

  return (
    <div ref={drop as any} className="w-[90%]">
      <Button
        ref={dragRef as any}
        style={{ opacity }}
        size="sm"
        isActive={dataStore.selectedBusStop?.id === busStop.busStopId}
        className={cn(
          "!text-gray-700 !font-normal !flex !justify-between !px-2 h-6 w-full",
        )}
        onClick={() => {
          if (dataStore.selectedBusStop?.id === busStop.busStopId) {
            dataStore.setSelectedBusStopIdx();
            return;
          }
          dataStore.setSelectedBusStopById(busStop.busStopId);
          onClick();
        }}
      >
        {`${idx + 1}. `}
        {busStop.busStop.name}
        <div className="flex gap-1">
          <Reorder />
          <Delete
            onClick={() => {
              if (dataStore.selectedRoute?.id) {
                void dataStore.removeBusStopFromRoute(
                  dataStore.selectedRoute.id,
                  busStop.busStopId,
                );
              }
            }}
          />
        </div>
      </Button>
    </div>
  );
};

export default BusStopDraggable;
