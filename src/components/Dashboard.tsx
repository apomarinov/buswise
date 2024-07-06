import Map from "app/components/Map";
import ModalForm from "app/components/ModalForm";
import SideBar from "app/components/SideBar";
import { useDataStore } from "app/contexts/DataStore";
import { useUiController } from "app/contexts/UIController";
import React from "react";

const Dashboard: React.FC = () => {
  const ui = useUiController();
  const dataStore = useDataStore();

  return (
    <div className="w-full h-full flex relative">
      {dataStore.busStopForm && (
        <ModalForm
          apiUrl="/bus-stop"
          data={dataStore.busStopForm}
          config={[{ field: "name" }, { field: "description" }]}
          title="Bus Stop"
          onClose={() => dataStore.setBusStopForm()}
          onSave={() => dataStore.setBusStopForm()}
        />
      )}
      {ui.showSideBar && <SideBar />}
      <Map mode="busStops" />
    </div>
  );
};

export default Dashboard;
