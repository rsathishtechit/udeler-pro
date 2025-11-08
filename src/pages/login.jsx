import React, { useContext } from "react";
import { UdemyContext } from "../context/context";
import { useNavigate } from "react-router-dom";
import { ipcRenderer } from "electron";
import useAuth from "../hooks/useAuth";

export default function Login() {
  const navigate = useNavigate();
  const { addToken } = useAuth();
  const onLogin = async () => {
    const token = ipcRenderer.sendSync(
      "login",
      "https://www.udemy.com/join/login-popup"
    );
    addToken(token);
    navigate("/dashboard");
  };
  return (
    <div className="flex min-h-screen flex-1 flex-col justify-center px-6 py-12 bg-gradient-to-br from-indigo-100 to-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl rounded-lg">
          <h2 className="text-center text-3xl font-extrabold text-gray-900 mb-8">
            Welcome to Udeler Pro
          </h2>
          <h3 className="text-center text-xl font-medium text-gray-600 mb-8">
            Sign in to your Udemy account
          </h3>

          <div className="mt-8">
            <button
              onClick={onLogin}
              type="submit"
              className="w-full flex justify-center items-center px-4 py-3 border border-transparent text-lg font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                />
              </svg>
              Continue with Udemy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
