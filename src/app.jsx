import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { HashRouter, Route, Routes } from "react-router-dom";
import { ipcRenderer } from "electron";
const { getRxStorageMemory } = require("rxdb/plugins/storage-memory");
const { getRxStorageIpcRenderer } = require("rxdb/plugins/electron");

import { getDatabase } from "./shared";
import Login from "./login";
import { AppContext } from "./context";
import Dashboard from "./dashboard";

const App = () => {
  const [db, setDb] = React.useState(null);

  React.useEffect(() => {
    const initDB = async () => {
      const storage = getRxStorageIpcRenderer({
        key: "main-storage",
        statics: getRxStorageMemory().statics,
        ipcRenderer: ipcRenderer,
      });
      const _db = await getDatabase("udeler-dev", storage);
      setDb(_db);
    };
  });

  return (
    <AppContext.Provider value={{ db }}>
      <HashRouter>
        <Routes>
          <Route exact path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          {/* <Route path="/secondPage" component={SecondPage} /> */}
        </Routes>
      </HashRouter>
    </AppContext.Provider>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
