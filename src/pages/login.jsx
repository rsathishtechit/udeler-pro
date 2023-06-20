import React, { useContext } from "react";
import { UdemyContext } from "../context/context";
import { useNavigate } from "react-router-dom";
import { ipcRenderer } from "electron";
import useAuth from "../hooks/useAuth";

export default function Login() {
  const { setToken } = useContext(UdemyContext);
  const navigate = useNavigate();
  const [addToken] = useAuth();
  const onLogin = async () => {
    const token = ipcRenderer.sendSync(
      "login",
      "https://www.udemy.com/join/login-popup"
    );
    addToken(token);
    navigate("/dashboard");
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
      </div>
    </div>
  );
}
