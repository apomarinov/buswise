import { ChakraProvider } from "@chakra-ui/react";
import Dashboard from "app/components/Dashboard";
import Chevron from "app/components/Icons/Chevron";
import Logo from "app/components/Icons/Logo";
import NavBar from "app/components/NavBar";
import { DataStoreContextProvider } from "app/contexts/DataStore";
import { UiControllerContextProvider } from "app/contexts/UIController";
import cn from "classnames";
import Head from "next/head";
import { useState } from "react";

export default function Home() {
  const [showUi, setShowUi] = useState(2);

  return (
    <ChakraProvider>
      <UiControllerContextProvider>
        <DataStoreContextProvider>
          <Head>
            <title>BusWise</title>
            <meta name="description" content="Generated by create-t3-app" />
            <link rel="icon" href="/favicon.ico" />
          </Head>
          <main className="flex h-[100dvh] flex-col items-center justify-center overflow-y-hidden">
            {showUi < 2 && (
              <>
                <Logo
                  size={30}
                  cls={cn(
                    "max-w-[30%] min-w-[20%] h-fit",
                    showUi === 1 && "slide-out-blurred-right",
                  )}
                  onAnimationEnd={() => setShowUi(2)}
                />
                {showUi < 1 && (
                  <div className="flex gap-4 items-center">
                    <h1 className="font-extrabold italic text-4xl text-gray-800">
                      BusWise
                    </h1>
                    <div
                      onClick={() => setShowUi(1)}
                      className="rounded-full p-2 bg-gray-100 opacity-70 hover:opacity-100 cursor-pointer active:opacity-70"
                    >
                      <Chevron cls="fill-gray-700" />
                    </div>
                  </div>
                )}
              </>
            )}
            {showUi === 2 && (
              <div className="fade-in w-full h-full flex flex-col">
                <NavBar />
                <Dashboard />
              </div>
            )}
          </main>
        </DataStoreContextProvider>
      </UiControllerContextProvider>
    </ChakraProvider>
  );
}