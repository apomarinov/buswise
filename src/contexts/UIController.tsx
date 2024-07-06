import useWindowSize from "app/hooks/useWindowSize";
import { type Mode } from "app/types/client";
import React, { useEffect, useState, type PropsWithChildren } from "react";

type UiControllerContext = {
  mode: Mode;
  setMode: (mode: Mode) => void;
  showSideBar: boolean;
  setShowSideBar: (showSideBar: boolean) => void;
};

const Context = React.createContext<UiControllerContext>({
  mode: "busStops",
  setMode: (mode: Mode) => true,
  showSideBar: false,
  setShowSideBar: (showSideBar: boolean) => true,
});

export const UiControllerContextProvider: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const [showSideBar, setShowSideBar] = useState(true);
  const [mode, setMode] = useState<Mode>("busStops");
  const { width } = useWindowSize();

  useEffect(() => {
    if (!showSideBar && width > 640) {
      setShowSideBar(true);
    }
  }, [width, showSideBar]);

  return (
    <Context.Provider
      value={{
        showSideBar,
        setShowSideBar,
        mode,
        setMode,
      }}
    >
      {children}
    </Context.Provider>
  );
};

export const useUiController = () => React.useContext(Context);
