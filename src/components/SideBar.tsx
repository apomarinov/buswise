import { Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/tabs";
import cn from "classnames";
import React from "react";

const SideBar: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState(0);
  const tabs = ["Bus Stops", "Routes"];

  return (
    <div className="flex drop-shadow-md flex-col bg-white max-w-[25%] min-w-[100px] max-sm:min-w-full max-sm:absolute top-0 left-0 max-sm:h-full z-[2]">
      <Tabs className="h-full" onChange={setActiveTab}>
        <TabList className="!flex !justify-evenly">
          {tabs.map((tab, idx) => (
            <Tab key={idx} className="w-full">
              <span
                className={cn("text-sm", idx === activeTab && "font-semibold")}
              >
                {tab}
              </span>
            </Tab>
          ))}
        </TabList>

        <TabPanels className="h-full">
          <TabPanel className="h-full"></TabPanel>
          <TabPanel className="h-full flex flex-col"></TabPanel>
        </TabPanels>
      </Tabs>
    </div>
  );
};

export default SideBar;
