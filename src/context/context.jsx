import React from "react";

export const UdemyContext = React.createContext({
  token: "",
  setToken: () => {},
  url: "",
  setURL: () => {},
});

export const DbContext = React.createContext({
  db: "",
  setdb: () => {},
});

export const DefaultSettingsContext = React.createContext({
  defaultSettings: {},
  setDefaultSettings: () => {},
});
