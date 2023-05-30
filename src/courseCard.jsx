import React, { useContext, useState, useReducer, useCallback } from "react";

import { UdemyContext } from "../context";

import { mkdirp } from "fs-extra";
import { join } from "path";
import Downloader from "mt-files-downloader";
const { homedir } = require("os");
import { getDownloadSpeed } from "./utils";

import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

const initialState = {
  download: false,
  pause: true,
  resume: true,
  totalLectures: 0,
  completedLectures: 0,
  completedPercentage: 0,
};

function downloadReducer(state = initialState, action) {
  switch (action.type) {
    case "download":
      return {
        ...state,
        download: !state.download,
        pause: !state.pause,
      };
    case "pause":
      return {
        ...state,
        pause: !state.pause,
        resume: !state.resume,
      };
    case "resume":
      return {
        ...state,
        resume: !state.resume,
        pause: !state.pause,
      };
    case "total":
      return {
        ...state,
        totalLectures: action.payload,
      };
    case "completed":
      const current = {
        ...state,
        completedLectures: state.completedLectures + 1,
      };
      return {
        ...current,
        completedPercentage:
          (current.completedLectures / current.totalLectures) * 100,
      };
    default:
      return state;
  }
}

export default function CourseCard({ course }) {
  const [downloadState, dispatch] = useReducer(downloadReducer, initialState);

  const [loading, setLoading] = useState(false);
  const [downloader] = useState(() => new Downloader());

  let { token, url } = useContext(UdemyContext);

  const pauseDownload = () => {
    downloader._downloads.forEach((dl) => dl.stop());
    dispatch({
      type: "pause",
    });
  };

  const resumeDownload = () => {
    downloader._downloads.forEach((dl) => dl.resume());
    dispatch({
      type: "resume",
    });
  };

  const fetchCourseData = async () => {
    dispatch({
      type: "download",
    });

    await fetch(
      `https://www.udemy.com/api-2.0/courses/${
        course.id
      }/cached-subscriber-curriculum-items?page_size=10000&q=${Date.now()}`,
      {
        headers: {
          // Authorization: `Bearer ${token}`,
          Authorization: `Bearer Y4XZZZlhAZqwTAY2h18J3ukdgWxRYBVoxdTtrYiN`,
        },
      }
    )
      .then((res) => res.json())
      .then(({ results }) => {
        const courseData = {};
        let current;
        let lectureCount = 0;
        results.forEach((item, index) => {
          if (item._class === "chapter") {
            current = index;
            courseData[index] = {};
            courseData[index]["meta"] = item;
          } else if (item._class === "lecture") {
            lectureCount += 1;
            if (courseData[current]["lectures"] === undefined)
              courseData[current]["lectures"] = {};
            courseData[current]["lectures"][index] = item;
          }
        });
        dispatch({ type: "total", payload: lectureCount });

        let homePath = join(homedir(), `Downloads/udeler/${course.title}`);
        let num = 0;

        for (const section in courseData) {
          num++;
          const sectionData = courseData[section];
          let sectionPath = join(
            homePath,
            num + "." + sectionData.meta.title.replace(/[/\\?%*:|"<>]/g, "-")
          );

          for (const lecture in sectionData.lectures) {
            const lectureData = sectionData.lectures[lecture];
            if (lectureData.asset.asset_type.toLowerCase() === "video") {
              fetch(
                `https://udemy.com/api-2.0/users/me/subscribed-courses/${
                  course.id
                }/lectures/${
                  lectureData.id
                }?fields[lecture]=asset,supplementary_assets&fields[asset]=stream_urls,download_urls,captions,title,filename,data,body,media_sources,media_license_token&q=${Date.now()}`,
                {
                  headers: {
                    Authorization: `Bearer Y4XZZZlhAZqwTAY2h18J3ukdgWxRYBVoxdTtrYiN`,
                  },
                }
              )
                .then((res) => res.json())
                .then(({ asset }) => {
                  let lecturePath = join(
                    sectionPath,
                    parseInt(lecture) +
                      1 +
                      "-" +
                      lectureData.title.replace(/[/\\?%*:|"<>]/g, "-") +
                      ".mp4"
                  );
                  if (asset.media_sources[0].type === "video/mp4") {
                    mkdirp(sectionPath).then(() => {
                      const download = downloader.download(
                        asset.media_sources[0]["src"],
                        lecturePath
                      );
                      download.setRetryOptions({
                        maxRetries: 3, // Default: 5
                        retryInterval: 3000, // Default: 2000
                      });

                      // Set download options
                      download.setOptions({
                        threadsCount: 1, // Default: 2, Set the total number of download threads
                        timeout: 5000, // Default: 5000, If no data is received, the download times out (milliseconds)
                        range: "0-100", // Default: 0-100, Control the part of file that needs to be downloaded.
                      });

                      var timer = setInterval(function () {
                        // Status:
                        //   -3 = destroyed
                        //   -2 = stopped
                        //   -1 = error
                        //   0 = not started
                        //   1 = started (downloading)
                        //   2 = error, retrying
                        //   3 = finished

                        if (
                          download.status === -1 ||
                          download.status === 3 ||
                          download.status === -3
                        ) {
                          clearInterval(timer);
                          timer = null;
                        }
                        if (download.status === 1) {
                          const stats = download.getStats();
                          var download_speed_and_unit = getDownloadSpeed(
                            parseInt(stats.present.speed / 1000) || 0
                          );

                          // console.log(
                          //   download_speed_and_unit,
                          //   stats.total,
                          //   stats.total.completed
                          // );
                        }
                      }, 1000);
                      download.start();
                      download.on("error", function (error) {
                        console.log("EVENT - Download " + error + " error !");
                        console.log(download.error);
                      });
                      download.on("progress", function (progress) {
                        console.log(
                          "EVENT - Download " + num + " progress " + progress
                        );
                      });
                      download.on("end", function () {
                        dispatch({
                          type: "completed",
                        });
                        console.log(
                          "EVENT - Download " + num + " end " + download.status
                        );
                      });
                    });
                  }
                });
            }
          }
        }
      });
  };

  return (
    <>
      <div className="flex gap-x-4">
        <img
          className="h-32 w-auto border border-gray-300 bg-white text-gray-300"
          src={course.image_480x270}
          alt=""
        />
        <div className="flex-2 py-4 ">
          <h4 className="text-lg font-bold">{course.title}</h4>
          <span className="isolate inline-flex rounded-md shadow-sm">
            <button
              type="button"
              className="relative inline-flex items-center rounded-l-md bg-white px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-10 disabled:opacity-25"
              onClick={fetchCourseData}
              disabled={downloadState.download}
            >
              <span className="sr-only">Download</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                />
              </svg>
            </button>

            <button
              type="button"
              className="relative -ml-px inline-flex items-center rounded-r-md bg-white px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-10 disabled:opacity-25"
              onClick={pauseDownload}
              disabled={downloadState.pause}
            >
              <span className="sr-only">Pause</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 5.25v13.5m-7.5-13.5v13.5"
                />
              </svg>
            </button>

            <button
              type="button"
              className="relative -ml-px inline-flex items-center rounded-r-md bg-white px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-10 disabled:opacity-25"
              onClick={resumeDownload}
              disabled={downloadState.resume}
            >
              <span className="sr-only">Resume</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
                />
              </svg>
            </button>
          </span>
        </div>
        <div className="flex-1 justify-items-end py-4 px-4">
          {downloadState.download && (
            <div style={{ width: 50, height: 50, float: "right" }}>
              <CircularProgressbar
                value={downloadState.completedPercentage}
                text={parseInt(downloadState.completedPercentage) + "%"}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
