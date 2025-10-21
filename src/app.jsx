import React, { useEffect, useState } from "react";

import * as ReactDOM from "react-dom/client";
import { HashRouter, Route, Routes } from "react-router-dom";
import Login from "./pages/login";
import {
  UdemyContext,
  DbContext,
  DefaultSettingsContext,
} from "./context/context";
import Dashboard from "./pages/dashboard";

import { init } from "@sentry/electron/renderer";
import { init as reactInit } from "@sentry/react";
import { getDatabase } from "./db/sqlite-renderer.js";
import * as Sentry from "@sentry/react";

function FallbackComponent() {
  return <div>An error has ocurred :</div>;
}
init(
  {
    /* config */
    dsn: "https://6665e2d7b9174976b95b33e4ab69c2a2@o4505397808660480.ingest.sentry.io/4505397811740672",
  },
  reactInit
);

const App = () => {
  const [token, setToken] = useState("");
  const [url, setURL] = useState("");
  const [db, setDb] = useState(null);
  const [defaultSettings, setDefaultSettings] = useState(null);

  init(
    {
      /* config */
    },
    reactInit
  );

  useEffect(() => {
    (async () => {
      const DB = getDatabase();
      if (DB) setDb(DB);
    })();
  }, []);

  return (
    <>
      <Sentry.ErrorBoundary fallback={FallbackComponent} showDialog>
        {db && (
          <UdemyContext.Provider value={{ token, setToken, url, setURL }}>
            <DbContext.Provider value={{ db, setDb }}>
              <DefaultSettingsContext.Provider
                value={{ defaultSettings, setDefaultSettings }}
              >
                <HashRouter>
                  <Routes>
                    <Route path="/" element={<Login />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                  </Routes>
                </HashRouter>
              </DefaultSettingsContext.Provider>
            </DbContext.Provider>
          </UdemyContext.Provider>
        )}
      </Sentry.ErrorBoundary>
    </>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
