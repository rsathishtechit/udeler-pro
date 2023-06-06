import React, { useContext, useState, useReducer } from "react";
export default function CoureseDetail({ lecture }) {
  return (
    <>
      <div>{lecture.title}</div>
      {lecture.status && (
        <div className="w-full bg-gray-200 rounded-full dark:bg-gray-700">
          <div
            className={`${
              lecture.status === 100 ? "bg-green-600" : "bg-blue-600"
            } text-xs font-medium text-blue-100 text-center p-0.5 leading-none rounded-full`}
            style={{ width: `${lecture.status}%` }}
          >
            {lecture.status} / {lecture.speed.value} - {lecture.speed.unit}
          </div>
        </div>
      )}
    </>
  );
}
