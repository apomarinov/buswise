import useWindowSize from "app/hooks/useWindowSize";
import React, { useEffect, useState, type PropsWithChildren } from "react";

type UiControllerContext = {
  showSideBar: boolean;
  setShowSideBar: (showSideBar: boolean) => void;
};

const Context = React.createContext<UiControllerContext>({
  showSideBar: false,
  setShowSideBar: (showSideBar: boolean) => true,
});

export const UiControllerContextProvider: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const [showSideBar, setShowSideBar] = useState(true);
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
      }}
    >
      {children}
    </Context.Provider>
  );
};

export const useUiController = () => React.useContext(Context);
