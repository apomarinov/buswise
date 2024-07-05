import Map from "app/components/Map";
import SideBar from "app/components/SideBar";
import { useDataStore } from "app/contexts/DataStore";
import useWindowSize from "app/hooks/useWindowSize";
import React, { useEffect } from "react";

const Dashboard: React.FC = () => {
  const dataStore = useDataStore();
  const { width } = useWindowSize();

  useEffect(() => {
    if (!dataStore.showSideBar && width > 640) {
      dataStore.setShowSideBar(true);
    }
  }, [width, dataStore.showSideBar]);

  return (
    <div className="w-full h-full flex relative">
      {dataStore.showSideBar && <SideBar />}
      <Map />
    </div>
  );
};

export default Dashboard;
