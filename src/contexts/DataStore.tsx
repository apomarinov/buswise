import { type BusStop } from "app/server/bus-stops";
import React, { useState, type PropsWithChildren } from "react";

type DataStoreContext = {
  showSideBar: boolean;
  setShowSideBar: (showSideBar: boolean) => void;
  busStopForm?: BusStop;
  setBusStopForm: (busStop?: BusStop) => void;
};

const Context = React.createContext<DataStoreContext>({
  showSideBar: false,
  setShowSideBar: (showSideBar: boolean) => true,
  busStopForm: undefined,
  setBusStopForm: (busStop?: BusStop) => true,
});

export const DataStoreContextProvider: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const [showSideBar, setShowSideBar] = useState(true);
  const [busStopForm, setBusStopForm] = useState<BusStop>();

  return (
    <Context.Provider
      value={{
        showSideBar,
        setShowSideBar,
        busStopForm,
        setBusStopForm,
      }}
    >
      {children}
    </Context.Provider>
  );
};

export const useDataStore = () => React.useContext(Context);
