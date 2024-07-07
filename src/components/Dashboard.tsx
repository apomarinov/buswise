import Map from "app/components/map/Map";
import ModalForm from "app/components/modal/ModalForm";
import SideBar from "app/components/SideBar";
import { useDataStore } from "app/contexts/DataStore";
import { useUiController } from "app/contexts/UIController";
import React from "react";

const Dashboard: React.FC = () => {
  const ui = useUiController();
  const dataStore = useDataStore();

  let newBusStopTitle = "Bus Stop";
  if (dataStore.selectedRoute) {
    newBusStopTitle =
      'Add new bus stop to route "' + dataStore.selectedRoute.name + '"';
  }

  return (
    <div className="w-full flex-grow flex relative">
      {dataStore.busStopForm && (
        <ModalForm
          apiUrl="/bus-stop"
          data={dataStore.busStopForm}
          fields={["name", "description"]}
          replaceTitle={!!dataStore.selectedRoute}
          title={newBusStopTitle}
          onClose={() => dataStore.setBusStopForm()}
          onSave={(data, isNew) => {
            dataStore.setBusStopForm();
            void dataStore.fetchBusStops();
            if (dataStore.selectedRoute) {
              if (isNew) {
                void dataStore.addBusStopToRoute(
                  dataStore.selectedRoute.id,
                  data.id as number,
                );
              } else {
              }
            }
          }}
        />
      )}
      {dataStore.routeForm && (
        <ModalForm
          apiUrl="/route"
          data={dataStore.routeForm}
          fields={["name"]}
          title="Route"
          onClose={() => dataStore.setRouteForm()}
          onSave={(data, isNew) => {
            dataStore.setRouteForm();
            if (isNew && dataStore.selectedBusStop) {
              void dataStore.addBusStopToRoute(
                data.id as number,
                dataStore.selectedBusStop.id,
              );
              dataStore.setSelectedRouteIdx(0);
            } else {
              void dataStore.fetchRoutes();
            }
          }}
        />
      )}
      {ui.showSideBar && <SideBar />}
      <Map />
    </div>
  );
};

export default Dashboard;
