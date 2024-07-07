import { api } from "app/api";
import { type BusStop } from "app/server/bus-stops";
import { type RouteWithData } from "app/server/routes";
import { type RouteForm } from "app/types/client";
import React, { useEffect, useState, type PropsWithChildren } from "react";

type DataStoreContext = {
  showSideBar: boolean;
  setShowSideBar: (showSideBar: boolean) => void;
  isLoading: boolean;
  busStopForm?: BusStop;
  setBusStopForm: (busStop?: BusStop) => void;
  fetchBusStops: (setActiveId?: number) => Promise<void>;
  busStops: BusStop[];
  selectedBusStopIdx?: number;
  setSelectedBusStopIdx: (idx?: number) => void;
  toggleSelectedBusStopIdx: (idx?: number) => void;
  selectedBusStop?: BusStop;
  deleteBusStop: (id: number) => Promise<void>;
  updateBusStop: (busStop: BusStop) => Promise<void>;
  routes: RouteWithData[];
  fetchRoutes: () => Promise<void>;
  selectedRouteIdx?: number;
  setSelectedRouteIdx: (idx?: number) => void;
  toggleSelectedRouteIdx: (idx?: number) => void;
  selectedRoute?: RouteWithData;
  routeForm?: RouteForm;
  setRouteForm: (route?: RouteForm) => void;
  addBusStopToRoute: (routeId: number, busStopId: number) => Promise<void>;
  removeBusStopFromRoute: (routeId: number, busStopId: number) => Promise<void>;
  routeFirstStops: { [k in string]: number };
  deleteRoute: (id: number) => Promise<void>;
  visibleRoutes: number[];
  toggleVisibleRoute: (idx: number, show: boolean) => void;
  showOnlyRoute: (idx?: number) => void;
  showReportForRoute?: number;
  toggleShowReportForRoute: (routeId: number) => void;
  setShowReportForRoute: (routeId?: number) => void;
  routeStopIds: { [k in number]: number[] };
};

const Context = React.createContext<DataStoreContext>({
  showSideBar: false,
  setShowSideBar: (showSideBar: boolean) => true,
  isLoading: true,
  busStopForm: undefined,
  setBusStopForm: (busStop?: BusStop) => true,
  fetchBusStops: () => Promise.resolve(),
  busStops: [],
  selectedBusStopIdx: undefined,
  setSelectedBusStopIdx: (idx?: number) => true,
  toggleSelectedBusStopIdx: (idx?: number) => true,
  selectedBusStop: undefined,
  deleteBusStop: (id: number) => Promise.resolve(),
  updateBusStop: (busStop: BusStop) => Promise.resolve(),
  routes: [],
  fetchRoutes: () => Promise.resolve(),
  selectedRouteIdx: undefined,
  setSelectedRouteIdx: (idx?: number) => true,
  toggleSelectedRouteIdx: (idx?: number) => true,
  selectedRoute: undefined,
  routeForm: undefined,
  setRouteForm: (route?: RouteForm) => true,
  addBusStopToRoute: (routeId: number, busStopId: number) => Promise.resolve(),
  removeBusStopFromRoute: (routeId: number, busStopId: number) =>
    Promise.resolve(),
  routeFirstStops: {},
  deleteRoute: (id: number) => Promise.resolve(),
  visibleRoutes: [],
  toggleVisibleRoute: (idx: number, show: boolean) => true,
  showOnlyRoute: (idx?: number) => true,
  showReportForRoute: undefined,
  toggleShowReportForRoute: (routeId: number) => true,
  setShowReportForRoute: (routeId?: number) => true,
  routeStopIds: [],
});

export const DataStoreContextProvider: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const [showSideBar, setShowSideBar] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [busStopForm, setBusStopForm] = useState<BusStop>();
  const [busStops, setBusStops] = useState<BusStop[]>([]);
  const [routes, setRoutes] = useState<RouteWithData[]>([]);
  const [selectedBusStopIdx, setSelectedBusStopIdx] = useState<number>();
  const [selectedRouteIdx, setSelectedRouteIdx] = useState<number>();
  const [routeForm, setRouteForm] = useState<RouteForm>();
  const [routeFirstStops, setRouteFirstStops] = useState<
    DataStoreContext["routeFirstStops"]
  >({});
  const [routeStopIds, setRouteStopIds] = useState<
    DataStoreContext["routeStopIds"]
  >({});
  const [visibleRoutes, setVisibleRoutes] = useState<number[]>([]);
  const [showReportForRoute, setShowReportForRoute] = useState<number>();

  const fetchBusStops = async () => {
    setIsLoading(true);
    const res = await api<BusStop[]>("/bus-stop", { method: "GET" });
    setIsLoading(false);
    setBusStops(res.data ?? []);
  };

  const deleteBusStop = async (id: number) => {
    setIsLoading(true);
    await api(`/bus-stop/${id}`, { method: "DELETE" });
    await fetchBusStops();
    await fetchRoutes();
    setIsLoading(false);
  };

  const updateBusStop = async (busStop: BusStop) => {
    setIsLoading(true);
    await api(`/bus-stop/${busStop.id}`, {
      method: "PUT",
      body: JSON.stringify(busStop),
      headers: {
        "Content-Type": "application/json",
      },
    });
    await fetchBusStops();
    setIsLoading(false);
  };

  const fetchRoutes = async () => {
    setIsLoading(true);
    const res = await api<RouteWithData[]>("/route", { method: "GET" });
    setIsLoading(false);
    const data = res.data ?? [];
    setRoutes(data);
    setRouteFirstStops(
      data.reduce((prev, curr) => {
        if (curr.routeBusStops?.[0]?.busStop.id) {
          prev[curr.routeBusStops[0].busStop.id] = curr.name;
        }
        return prev;
      }, {} as any),
    );
    setRouteStopIds(
      data.reduce((prev, curr) => {
        prev[curr.id] = curr.routeBusStops.map((b) => b.busStopId);
        return prev;
      }, {} as any),
    );
  };

  const deleteRoute = async (id: number) => {
    setIsLoading(true);
    await api(`/route/${id}`, { method: "DELETE" });
    await fetchRoutes();
    setIsLoading(false);
  };

  const addBusStopToRoute = async (routeId: number, busStopId: number) => {
    setIsLoading(true);
    await api(`/route/${routeId}/bus-stop`, {
      method: "POST",
      body: JSON.stringify({ busStopId }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    await fetchRoutes();
    setIsLoading(false);
  };

  const removeBusStopFromRoute = async (routeId: number, busStopId: number) => {
    setIsLoading(true);
    await api(`/route/${routeId}/bus-stop/${busStopId}`, {
      method: "DELETE",
      body: JSON.stringify({ busStopId }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    await fetchRoutes();
    setIsLoading(false);
  };

  const toggleVisibleRoute = (idx: number, show: boolean) => {
    setVisibleRoutes((old) => {
      if (!show) {
        const visible = old.indexOf(idx);
        if (visible >= 0) {
          old.splice(visible, 1);
        }
      } else {
        old.push(idx);
      }
      return [...new Set(old)];
    });
  };

  useEffect(() => {
    void fetchBusStops();
    void fetchRoutes();
  }, []);

  const selectedBusStop =
    selectedBusStopIdx !== undefined ? busStops[selectedBusStopIdx] : undefined;

  const selectedRoute =
    selectedRouteIdx !== undefined ? routes[selectedRouteIdx] : undefined;

  const toggleSelectedRouteIdx = (v?: number) =>
    setSelectedRouteIdx((old) => (v === old ? undefined : v));

  const toggleSelectedBusStopIdx = (v?: number) =>
    setSelectedBusStopIdx((old) => (v === old ? undefined : v));

  const toggleShowReportForRoute = (v: number) =>
    setShowReportForRoute((old) => (v === old ? undefined : v));

  const showOnlyRoute = (idx?: number) => {
    setVisibleRoutes([idx].filter((i) => i! >= 0) as number[]);
  };

  return (
    <Context.Provider
      value={{
        showSideBar,
        setShowSideBar,
        busStopForm,
        setBusStopForm,
        fetchBusStops,
        busStops,
        isLoading,
        selectedBusStopIdx,
        setSelectedBusStopIdx,
        selectedBusStop,
        deleteBusStop,
        updateBusStop,
        routes,
        fetchRoutes,
        selectedRouteIdx,
        setSelectedRouteIdx,
        toggleSelectedRouteIdx,
        toggleSelectedBusStopIdx,
        selectedRoute,
        routeForm,
        setRouteForm,
        addBusStopToRoute,
        routeFirstStops,
        deleteRoute,
        visibleRoutes,
        toggleVisibleRoute,
        showReportForRoute,
        toggleShowReportForRoute,
        showOnlyRoute,
        setShowReportForRoute,
        routeStopIds,
        removeBusStopFromRoute,
      }}
    >
      {children}
    </Context.Provider>
  );
};

export const useDataStore = () => React.useContext(Context);
