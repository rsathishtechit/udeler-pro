import React, { useContext } from "react";

import { useNavigate } from "react-router-dom";
import { AppContext } from "./context";
import { ipcRenderer } from "electron";

export default function Login() {
  const navigate = useNavigate();
  const { db } = useContext(AppContext);

  // ipcRenderer.sendSync("login", "https://www.udemy.com/join/login-popup");
  const onLogin = async () => {
    const token = ipcRenderer.sendSync(
      "login",
      "https://www.udemy.com/join/login-popup"
    );
    console.log(token);
    console.log(db);
    await db.auth.insert({ token });
    // console.log("inserting hero DONE");
    // db.auth.find().$.subscribe;
    navigate("/dashboard", { token });
  };
  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
          Sign in to your Udemy account
        </h2>
        <h4 className="mt-10 text-center font-bold leading-9 tracking-tight text-gray-900">
          (By selecting any of the following options are available)
        </h4>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <div>
          <button
            onClick={onLogin}
            type="submit"
            className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Sign in
          </button>
        </div>

        <p className="mt-10 text-center text-sm text-gray-500">
          Not a member?{" "}
          <a
            href="#"
            className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500"
          >
            Start a 14 day free trial
          </a>
        </p>
      </div>
    </div>
  );
}
