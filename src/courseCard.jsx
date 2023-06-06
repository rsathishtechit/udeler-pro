import React, { useContext, useState, useReducer } from "react";

import { UdemyContext } from "../context";

import Downloader from "mt-files-downloader";

import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

import { initialState, downloadReducer } from "./store/downloadReducer";
import useFetchCourseData from "./hooks/useFetchCourseData";
import useFetchLectureData from "./hooks/useFetchLectureData";
import { getDownloadSpeed } from "./utils/utils";

import { join } from "path";
const { homedir } = require("os");
import fs, { mkdirp } from "fs-extra";

import CoureseDetail from "./courseDetail";

export default function CourseCard({ course }) {
  const [downloadState, dispatch] = useReducer(downloadReducer, initialState);
  const [downloader] = useState(() => new Downloader());

  const [courseData, lectureCount] = useFetchCourseData(course.id);
  const [lectureStatus, setLectureStatus] = useState({});
  const [fetchLectureData] = useFetchLectureData();

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

  const downloadCourse = async () => {
    console.log("courseData", courseData);
    dispatch({ type: "download" });
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
        const type = sectionData.lectures[lecture].asset.asset_type;
        console.log(type);

        setLectureStatus((prev) => ({
          ...prev,
          [lectureData.id]: { title: lectureData.title },
        }));

        const data = await fetchLectureData(course.id, lectureData.id, type);
        console.log(data);

        let lecturePath = join(
          sectionPath,
          parseInt(lecture) +
            1 +
            "-" +
            lectureData.title.replace(/[/\\?%*:|"<>]/g, "-") +
            ".mp4"
        );

        if (data.type === "Video" && !data.encrypted) {
          console.log("dfdfdfdfd");
          mkdirp(sectionPath).then(() => {
            const download = downloader.download(data.url, lecturePath);

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

                setLectureStatus((prev) => ({
                  ...prev,
                  [lectureData.id]: {
                    ...prev[[lectureData.id]],
                    speed: download_speed_and_unit,
                    status: stats.total.completed,
                  },
                }));

                console.log(
                  download_speed_and_unit,
                  stats.total,
                  stats.total.completed
                );
              }
            }, 1000);
            download.start();
            download.on("error", function (error) {
              if (
                download.status === -1 &&
                download.stats.total.size == 0 &&
                fs.existsSync(download.filePath)
              ) {
                download.destroy("end");
                clearInterval(timer);
              }
              // console.log("EVENT - Download " + error + " error !");
              // console.log(download.error);
            });
            download.on("progress", function (progress) {
              console.log(download.getStats());
              console.log("EVENT - Download " + num + " progress " + progress);
            });
            download.on("end", function () {
              dispatch({
                type: "completed",
              });
              setLectureStatus((prev) => ({
                ...prev,
                [lectureData.id]: {
                  ...prev[[lectureData.id]],
                  speed: 0,
                  status: 100,
                },
              }));
              console.log(
                "EVENT - Download " + num + " end " + download.status
              );
            });
          });
        }
      }
    }
  };

  return (
    <div className="flex-coulumn gap-x-4">
      <div className="flex-1 ">
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
                onClick={downloadCourse}
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
      </div>

      <div className="flex-1">
        <div className="flex-column gap-x-4">
          {lectureStatus &&
            Object.values(lectureStatus).map((lecture, index) => (
              <CoureseDetail lecture={lecture} key={index} />
            ))}
        </div>
      </div>
    </div>
  );
}
