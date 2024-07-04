import { GeistSans } from "geist/font/sans";
import { type AppType } from "next/app";

import "app/styles/globals.css";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <main className={GeistSans.className}>
      <Component {...pageProps} />
    </main>
  );
};

export default MyApp;
