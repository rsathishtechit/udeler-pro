import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { HashRouter, Route, Routes } from "react-router-dom";
import Login from "./login";
import { UdemyContext, SettingsContext } from "../context";
import Dashboard from "./dashboard";

const { getDatabase } = require("./shared");
const { getRxStorageMemory } = require("rxdb/plugins/storage-memory");
const { getRxStorageIpcRenderer } = require("rxdb/plugins/electron");

const { ipcRenderer } = require("electron");

const App = () => {
  const [token, setToken] = React.useState("");
  const [url, setURL] = React.useState("");
  const [settings, setSettings] = React.useState({});

  async function run() {
    const storage = getRxStorageIpcRenderer({
      key: "main-storage",
      statics: getRxStorageMemory().statics,
      ipcRenderer: ipcRenderer,
    });

    console.log("GET DATABASE");

    const db = await getDatabase(
      "heroesdb", // we add a random timestamp in dev-mode to reset the database on each start
      storage
    );

    console.log("GET DATABASE DONE");

    db.heroes
      .find()
      .sort({
        name: "asc",
      })
      .$.subscribe(function (heroes) {
        if (!heroes) {
          heroesList.innerHTML = "Loading..";
          return;
        }
        console.log("observable fired");
        console.dir(heroes);
      });
  }

  React.useEffect(() => {
    (async () => {
      const storage = getRxStorageIpcRenderer({
        key: "main-storage",
        statics: getRxStorageMemory().statics,
        ipcRenderer: ipcRenderer,
      });
      const db = await getDatabase(
        "heroesdb", // we add a random timestamp in dev-mode to reset the database on each start
        storage
      );
      setSettings(db);
    })();
  }, []);

  // run();

  console.log();

  return (
    <UdemyContext.Provider value={{ token, setToken, url, setURL }}>
      <SettingsContext.Provider value={{ settings, setSettings }}>
        <HashRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </HashRouter>
      </SettingsContext.Provider>
    </UdemyContext.Provider>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
