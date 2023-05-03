import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { HashRouter, Route, Routes } from "react-router-dom";
import Login from "./login";
import { UdemyContext } from "../context";
import Dashboard from "./dashboard";

const App = () => {
  const [token, setToken] = React.useState("");
  const [url, setURL] = React.useState("");
  return (
    <React.StrictMode>
      <UdemyContext.Provider value={{ token, setToken, url, setURL }}>
        <HashRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </HashRouter>
      </UdemyContext.Provider>
    </React.StrictMode>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
