import { Button } from "@chakra-ui/react";
import { api } from "app/api";
import Delete from "app/components/Icons/Delete";
import Edit from "app/components/Icons/Edit";
import Eye from "app/components/Icons/Eye";
import EyeCrossed from "app/components/Icons/EyeCrossed";
import Report from "app/components/Icons/Report";
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
  id: number;
  name: string;
  onClick: () => void;
  actions: {
    [k in SideBarItemActionType]?: () => Promise<void>;
  };
  hiddenAction?: SideBarItemActionType;
};

const ActionIcons: {
  [k in SideBarItemActionType]: React.FC<React.SVGProps<any>>;
} = {
  edit: Edit,
  show: EyeCrossed,
  hide: Eye,
  delete: Delete,
  report: Report,
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
    dataStore.showOnlyRoute();
    dataStore.setShowReportForRoute();
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
        id: busStop.id,
        name: busStop.name,
        onClick: () => {
          dataStore.toggleSelectedBusStopIdx(idx);
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

  const toggleRouteViewIcon = (
    idx: number,
    action: SideBarItemActionType,
    only?: boolean,
  ) => {
    setHiddenActions((old) => {
      if (only) {
        Object.keys(old).forEach((key) => {
          old[key as unknown as number] = "hide";
        });
      }
      old[idx] = action;
      return { ...old };
    });
  };

  useEffect(() => {
    if (ui.mode !== "routes") {
      return;
    }
    const newConfig: SideBarItem[] = [];
    const newHiddenActions: typeof hiddenActions = {};

    dataStore.routes.forEach((route, idx) => {
      newHiddenActions[idx] =
        dataStore.selectedRoute?.id === route.id ? "show" : "hide";
      newConfig.push({
        id: route.id,
        name: route.name,
        onClick: () => {
          dataStore.toggleSelectedRouteIdx(idx);
          setActiveItem((old) => (old === idx ? undefined : old));
          dataStore.setShowReportForRoute();
          toggleRouteViewIcon(idx, "show");
          dataStore.toggleVisibleRoute(idx, true);
        },
        actions: {
          show: async () => {
            toggleRouteViewIcon(idx, "show");
            dataStore.toggleVisibleRoute(idx, true);
          },
          hide: async () => {
            toggleRouteViewIcon(idx, "hide");
            dataStore.toggleVisibleRoute(idx, false);
            dataStore.setShowReportForRoute();
          },
          report: async () => {
            dataStore.toggleShowReportForRoute(route.id);
            dataStore.showOnlyRoute(idx);
            toggleRouteViewIcon(idx, "show", true);
            dataStore.setSelectedRouteIdx(idx);
          },
          edit: async () =>
            dataStore.setRouteForm({
              id: route.id,
              name: route.name,
            }),
          delete: async () => onDeleteRoute(route),
        },
        hiddenAction: !!route.history ? undefined : "report",
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

  useEffect(() => {
    if (
      dataStore.selectedRouteIdx === 0 &&
      dataStore.selectedRoute?.routeBusStops?.length === 1
    ) {
      toggleRouteViewIcon(0, "show");
      dataStore.toggleVisibleRoute(0, true);
    }
  }, [dataStore.selectedRouteIdx, dataStore.selectedRoute]);

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
              "flex w-1/2 text-sm opacity-80 hover:opacity-100 items-center justify-center cursor-pointer hover:bg-gray-200 active:bg-gray-100",
              ui.mode === modes[idx] &&
                "font-semibold bg-gray-100 !opacity-100",
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
          <div
            key={idx + ui.mode}
            className="flex w-full flex-col gap-2 items-end"
          >
            <Button
              size="sm"
              className={cn(
                "!text-gray-700 !font-normal !flex !justify-between !px-2 min-h-9 w-full",
                activeItem === idx && "!font-semibold !text-gray-800",
              )}
              isActive={activeItem === idx}
              onClick={cfg.onClick}
            >
              {cfg.name}
              {Object.keys(cfg.actions).length > 0 &&
                (!dataStore.showReportForRoute ||
                  (dataStore.showReportForRoute === cfg.id &&
                    ui.mode === "routes")) && (
                  <div className="flex gap-1.5 items-center">
                    {Object.keys(cfg.actions)
                      .filter(
                        (a) =>
                          a !== hiddenActions[idx] && a !== cfg.hiddenAction,
                      )
                      .map((key, aIdx) => {
                        const action = key as SideBarItemActionType;
                        const Icon = ActionIcons[action];
                        return (
                          <Icon
                            key={key}
                            onClickCapture={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              void cfg.actions[action]?.();
                            }}
                          />
                        );
                      })}
                  </div>
                )}
            </Button>
            {ui.mode === "routes" && cfg.id === dataStore.selectedRoute?.id && (
              <div className="w-full flex flex-col gap-2 items-end">
                {!dataStore.selectedRoute?.routeBusStops?.length && (
                  <p className="text-center text-xs ml-6 bg-green-100 rounded-lg py-1 px-2 text-gray-700">
                    Click a Bus Stop in the map to add to this route
                  </p>
                )}
                {dataStore.selectedRoute?.routeBusStops?.map((busStop) => {
                  return (
                    <Button
                      key={busStop.busStop.name}
                      size="sm"
                      isActive={
                        dataStore.selectedBusStop?.id === busStop.busStopId
                      }
                      className={cn(
                        "w-[90%] !text-gray-700 !font-normal !flex !justify-between !px-2 h-6 w-full",
                      )}
                      onClick={() =>
                        dataStore.setSelectedBusStopById(busStop.busStopId)
                      }
                    >
                      {busStop.busStop.name}
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
                    </Button>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SideBar;
