import { Button } from "@chakra-ui/react";
import { api } from "app/api";
import Delete from "app/components/Icons/Delete";
import Edit from "app/components/Icons/Edit";
import Eye from "app/components/Icons/Eye";
import EyeCrossed from "app/components/Icons/EyeCrossed";
import ModalConfirm, {
  type ModalConfirmProps,
} from "app/components/modal/ModalConfirm";
import { useDataStore } from "app/contexts/DataStore";
import { useUiController } from "app/contexts/UIController";
import { type BusStop } from "app/server/bus-stops";
import { type Route, type RouteWithData } from "app/server/routes";
import { type Mode } from "app/types/client";
import cn from "classnames";
import React, { useEffect, useState } from "react";

type SideBarItemActionType = "edit" | "delete" | "show" | "report" | "hide";

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
  show: EyeCrossed,
  hide: Eye,
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
  const [hiddenActions, setHiddenActions] = useState<{
    [k in number]?: SideBarItemActionType;
  }>({});

  const changeMode = async (mode: Mode) => {
    ui.setMode(mode);
    setActiveItem(undefined);
    dataStore.setSelectedBusStopIdx();
    dataStore.setSelectedRouteIdx();
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

  const onDeleteRoute = async (route: RouteWithData) => {
    setDeleteModal({
      confirmText: "Delete",
      description: `Are you sure you want to delete route "${route.name}"`,
      title: "Delete Route",
      onCancel: () => setDeleteModal(undefined),
      onConfirm: async () => {
        setActiveItem(undefined);
        await dataStore.deleteRoute(route.id);
        setDeleteModal(undefined);
      },
    });
  };

  useEffect(() => {
    if (ui.mode !== "busStops") {
      return;
    }
    const newConfig: SideBarItem[] = [];
    dataStore.busStops.forEach((busStop, idx) => {
      newConfig.push({
        name: busStop.name,
        onClick: () => {
          dataStore.toggleBusStopIdx(idx);
          setActiveItem((old) => (old === idx ? undefined : old));
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
  }, [dataStore.busStops, ui.mode]);

  const toggleRoute = (idx: number, action: SideBarItemActionType) => {
    setHiddenActions((old) => {
      old[idx] = action;
      return { ...old };
    });
    dataStore.toggleVisibleRoute(idx);
  };

  useEffect(() => {
    if (ui.mode !== "routes") {
      return;
    }
    const newConfig: SideBarItem[] = [];
    const newHiddenActions: typeof hiddenActions = {};
    dataStore.routes.forEach((route, idx) => {
      newHiddenActions[idx] = "hide";
      newConfig.push({
        name: route.name,
        onClick: () => {
          dataStore.toggleRouteIdx(idx);
          setActiveItem((old) => (old === idx ? undefined : old));
        },
        actions: {
          show: async () => toggleRoute(idx, "show"),
          hide: async () => toggleRoute(idx, "hide"),
          edit: async () =>
            dataStore.setRouteForm({
              id: route.id,
              name: route.name,
            }),
          delete: async () => onDeleteRoute(route),
        },
      });
    });
    setHiddenActions(newHiddenActions);
    setConfig(newConfig);
    let message = "";
    if (!newConfig.length && !dataStore.busStops.length) {
      message = "Click on the map to add a new bus stop";
    }
    if (!newConfig.length && dataStore.busStops.length) {
      message = "Select a bus stop to create a route";
    }
    setEmptyMessage(message);
  }, [dataStore.routes, ui.mode, dataStore.busStops]);

  useEffect(() => {
    if (dataStore.selectedBusStopIdx !== undefined) {
      setActiveItem(dataStore.selectedBusStopIdx);
    }
    if (dataStore.selectedRouteIdx !== undefined) {
      setActiveItem(dataStore.selectedRouteIdx);
    }
  }, [dataStore.selectedBusStopIdx, dataStore.selectedRouteIdx]);

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
            key={idx + ui.mode}
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
                {Object.keys(cfg.actions)
                  .filter((a) => a !== hiddenActions[idx])
                  .map((key, aIdx) => {
                    const action = key as SideBarItemActionType;
                    const Icon = ActionIcons[action];
                    return (
                      <Icon
                        key={key}
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
