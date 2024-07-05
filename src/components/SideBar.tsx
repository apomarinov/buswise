import { Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/tabs";
import React from "react";

const SideBar: React.FC = () => {
  return (
    <div className="flex drop-shadow-md flex-col bg-white max-w-[25%] min-w-[300px] max-sm:min-w-full max-sm:absolute top-0 left-0 max-sm:h-full z-[2]">
      <Tabs className="h-full">
        <TabList className="!flex !justify-evenly">
          <Tab className="w-full">
            <span className="text-sm">Routes</span>
          </Tab>
          <Tab className="w-full">
            <span className="text-sm">Bus Stops</span>
          </Tab>
        </TabList>

        <TabPanels className="h-full">
          <TabPanel className="h-full">
            <p>one!</p>
          </TabPanel>
          <TabPanel className="h-full">
            <p>two!</p>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>
  );
};

export default SideBar;
