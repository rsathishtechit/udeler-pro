import React from "react";

export const UdemyContext = React.createContext({
  token: "0",
  setToken: () => {},
  url: "",
  setURL: () => {},
});

export const DbContext = React.createContext({
  db: "",
  setdb: () => {},
});
