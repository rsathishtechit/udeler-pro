import * as React from "react";

import * as ReactDOM from "react-dom/client";
import { HashRouter, Route, Routes } from "react-router-dom";
import Login from "./pages/login";
import {
  UdemyContext,
  DbContext,
  DefaultSettingsContext,
} from "./context/context";
import Dashboard from "./pages/dashboard";

const { getDatabase } = require("./rxdb/shared");
const { getRxStorageMemory } = require("rxdb/plugins/storage-memory");
const { getRxStorageIpcRenderer } = require("rxdb/plugins/electron");

const { ipcRenderer } = require("electron");

import * as Sentry from "@sentry/react";

function FallbackComponent() {
  return <div>An error has ocurred :</div>;
}

const App = () => {
  const [token, setToken] = React.useState("");
  const [url, setURL] = React.useState("");
  const [db, setDb] = React.useState(null);
  const [defaultSettings, setDefaultSettings] = React.useState(null);

  React.useEffect(() => {
    (async () => {
      const storage = getRxStorageIpcRenderer({
        key: "main-storage",
        statics: getRxStorageMemory().statics,
        ipcRenderer: ipcRenderer,
      });
      const DB = await getDatabase(
        "udelerpro", // we add a random timestamp in dev-mode to reset the database on each start
        storage
      );
      await setDb(DB);
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
