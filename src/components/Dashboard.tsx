import Map from "app/components/map/Map";
import ModalForm from "app/components/modal/ModalForm";
import SideBar from "app/components/SideBar";
import { useDataStore } from "app/contexts/DataStore";
import { useUiController } from "app/contexts/UIController";
import React from "react";

const Dashboard: React.FC = () => {
  const ui = useUiController();
  const dataStore = useDataStore();

  return (
    <div className="w-full h-full overflow-hidden flex relative">
      {dataStore.busStopForm && (
        <ModalForm
          apiUrl="/bus-stop"
          data={dataStore.busStopForm}
          fields={["name", "description"]}
          title="Bus Stop"
          onClose={() => dataStore.setBusStopForm()}
          onSave={() => {
            dataStore.setBusStopForm();
            void dataStore.fetchBusStops();
          }}
        />
      )}
      {ui.showSideBar && <SideBar />}
      <Map mode="busStops" />
    </div>
  );
};

export default Dashboard;
