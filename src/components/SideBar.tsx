import { Button } from "@chakra-ui/react";
import { api } from "app/api";
import Delete from "app/components/Icons/Delete";
import Edit from "app/components/Icons/Edit";
import ModalConfirm, {
  type ModalConfirmProps,
} from "app/components/modal/ModalConfirm";
import { useDataStore } from "app/contexts/DataStore";
import { useUiController } from "app/contexts/UIController";
import { type BusStop } from "app/server/bus-stops";
import { type Route } from "app/server/routes";
import { type Mode } from "app/types/client";
import cn from "classnames";
import React, { useEffect, useState } from "react";

type SideBarItemActionType = "edit" | "delete" | "toggle" | "report";

type SideBarItem = {
  name: string;
  onClick: () => void;
  actions: {
    [k in SideBarItemActionType]?: () => Promise<void>;
  };
};

const ActionIcons: {
  [k in SideBarItemActionType]: React.FC<React.SVGProps<any>>;
} = {
  edit: Edit,
  delete: Delete,
};

const SideBar: React.FC = () => {
  const ui = useUiController();
  const dataStore = useDataStore();
  const tabs = ["Bus Stops", "Routes"];
  const modes: Mode[] = ["busStops", "routes"];
  const [config, setConfig] = useState<SideBarItem[]>([]);
  const [activeItem, setActiveItem] = useState<number>();
  const [emptyMessage, setEmptyMessage] = useState("");
  const [deleteModal, setDeleteModal] = useState<ModalConfirmProps>();

  const changeMode = async (mode: Mode) => {
    ui.setMode(mode);
    switch (mode) {
      case "busStops":
        void dataStore.fetchBusStops();
        break;
    }
  };

  const onDeleteBusStop = async (busStop: BusStop) => {
    const routes = await api<Route[]>(`/bus-stop/${busStop.id}/routes`, {
      method: "GET",
    });
    let description = `Are you sure you want to delete bus stop "${busStop.name}"`;
    if (routes.data?.length) {
      description += ` which is used by ${routes.data.length} route${routes.data.length > 1 ? "s" : ""}`;
    }
    description += "?";
    setDeleteModal({
      confirmText: "Delete",
      description,
      title: "Delete Bus Stop",
      onCancel: () => setDeleteModal(undefined),
      onConfirm: async () => {
        setActiveItem(undefined);
        await dataStore.deleteBusStop(busStop.id);
        setDeleteModal(undefined);
      },
    });
  };

  useEffect(() => {
    const newConfig: SideBarItem[] = [];
    dataStore.busStops.forEach((busStop, idx) => {
      newConfig.push({
        name: busStop.name,
        onClick: () => {
          dataStore.setSelectedBusStopIdx(idx);
          setActiveItem(idx);
        },
        actions: {
          edit: async () => dataStore.setBusStopForm(busStop),
          delete: async () => onDeleteBusStop(busStop),
        },
      });
    });
    setConfig(newConfig);
    setEmptyMessage(
      !newConfig.length ? "Click on the map to add a new bus stop" : "",
    );
  }, [dataStore.busStops]);

  useEffect(() => {
    if (dataStore.selectedBusStopIdx !== undefined) {
      setActiveItem(dataStore.selectedBusStopIdx);
    }
  }, [dataStore.selectedBusStopIdx]);

  return (
    <div className="flex relative drop-shadow-md flex-col bg-white max-w-[25%] min-w-[200px] max-sm:min-w-full max-sm:absolute top-0 left-0 max-sm:h-full z-[2]">
      {dataStore.isLoading && (
        <div className="bg-white z-10 cursor-wait opacity-70 absolute top-0 left-0 w-full h-full"></div>
      )}
      {deleteModal && (
        <ModalConfirm {...deleteModal} isLoading={dataStore.isLoading} />
      )}
      <div className="flex w-full min-h-8 h-11">
        {tabs.map((tab, idx) => (
          <span
            key={idx}
            onClick={() => changeMode(modes[idx]!)}
            className={cn(
              "flex w-1/2 text-sm items-center justify-center cursor-pointer hover:bg-gray-200 active:bg-gray-100",
              ui.mode === modes[idx] && "font-semibold bg-gray-100",
            )}
          >
            {tab}
          </span>
        ))}
      </div>
      <div className="w-full h-full flex flex-col gap-2 p-2 overflow-y-auto">
        {emptyMessage && (
          <div className="m-auto text-center font-semibold text-sm mx-4">
            {emptyMessage}
          </div>
        )}
        {config.map((cfg, idx) => (
          <Button
            key={idx}
            size="sm"
            className={cn(
              "!text-gray-700 !font-normal !flex !justify-between !px-2 min-h-9",
              activeItem === idx && "!font-semibold !text-gray-800",
            )}
            isActive={activeItem === idx}
            onClick={cfg.onClick}
          >
            {cfg.name}
            {Object.keys(cfg.actions).length > 0 && (
              <div className="flex gap-1.5 items-center">
                {Object.keys(cfg.actions).map((key, aIdx) => {
                  const action = key as SideBarItemActionType;
                  const Icon = ActionIcons[action];
                  return (
                    <Icon
                      key={aIdx}
                      onClick={(e) => {
                        e.stopPropagation();
                        void cfg.actions[action]?.();
                      }}
                    />
                  );
                })}
              </div>
            )}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default SideBar;
