import Close from "app/components/Icons/Close";
import Hamburger from "app/components/Icons/Hamburger";
import Logo from "app/components/Icons/Logo";
import { useDataStore } from "app/contexts/DataStore";
import React from "react";

const NavBar: React.FC = () => {
  const dataStore = useDataStore();
  return (
    <div className="w-full bg-white drop-shadow-sm h-12 px-4 flex items-center justify-between z-10">
      <div className="slide-in-blurred-left">
        <Logo />
      </div>
      <div
        className="hidden max-sm:block cursor-pointer"
        onClick={() => dataStore.setShowSideBar(!dataStore.showSideBar)}
      >
        {!dataStore.showSideBar && <Hamburger size={1.8} />}
        {dataStore.showSideBar && <Close size={1.8} />}
      </div>
    </div>
  );
};

export default NavBar;
