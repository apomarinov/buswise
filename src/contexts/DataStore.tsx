import { api } from "app/api";
import { type BusStop } from "app/server/bus-stops";
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
  selectedBusStop?: BusStop;
  deleteBusStop: (id: number) => Promise<void>;
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
  selectedBusStop: undefined,
  deleteBusStop: (id: number) => Promise.resolve(),
});

export const DataStoreContextProvider: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const [showSideBar, setShowSideBar] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [busStopForm, setBusStopForm] = useState<BusStop>();
  const [busStops, setBusStops] = useState<BusStop[]>([]);
  const [selectedBusStopIdx, setSelectedBusStopIdx] = useState<number>();

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
    setIsLoading(false);
  };

  useEffect(() => {
    void fetchBusStops();
  }, []);

  const selectedBusStop =
    selectedBusStopIdx !== undefined ? busStops[selectedBusStopIdx] : undefined;

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
      }}
    >
      {children}
    </Context.Provider>
  );
};

export const useDataStore = () => React.useContext(Context);
