import React, { useState, type PropsWithChildren } from "react";

type DataStoreContext = {
  showSideBar: boolean;
  setShowSideBar: (showSideBar: boolean) => void;
};

const Context = React.createContext<DataStoreContext>({
  showSideBar: false,
  setShowSideBar: (showSideBar: boolean) => true,
});

export const DataStoreContextProvider: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const [showSideBar, setShowSideBar] = useState(true);

  return (
    <Context.Provider
      value={{
        showSideBar,
        setShowSideBar,
      }}
    >
      {children}
    </Context.Provider>
  );
};

export const useDataStore = () => React.useContext(Context);
