import React, { useState, useReducer, useContext } from "react";

import { DefaultSettingsContext, UdemyContext } from "../context/context";

import Downloader from "mt-files-downloader";

import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

import { initialState, downloadReducer } from "../store/downloadReducer";
import useFetchCourseData from "../hooks/useFetchCourseData";
import useFetchLectureData from "../hooks/useFetchLectureData";

import { join } from "path";
const { homedir } = require("os");

import fs, { mkdirp } from "fs-extra";
const https = require("https");

import CoureseDetail from "./courseDetail";
import downloadLecture from "../utils/downloadLecture";

export default function CourseCard({ course }) {
  const [downloader] = useState(() => new Downloader());
  const [downloadState, dispatch] = useReducer(downloadReducer, initialState);
  const [courseData, lectureCount] = useFetchCourseData(course.id);
  const [fetchLectureData] = useFetchLectureData();
  const [open, setOpen] = useState(false);

  const [lectureStatus, setLectureStatus] = useState({});

  let { token, url } = useContext(UdemyContext);
  let { defaultSettings } = useContext(DefaultSettingsContext);

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
    dispatch({ type: "download" });
    dispatch({ type: "status" });
    dispatch({ type: "total", payload: lectureCount });

    let homePath = defaultSettings.downloadPath
      ? `${defaultSettings.downloadPath}/${course.title}`
      : join(homedir(), `Downloads/${course.title}`);

    let num = 0;

    for (const section in courseData) {
      num++;
      const sectionData = courseData[section];
      // console.log("sectionData", sectionData);

      let sectionPath = join(
        homePath,
        num + "." + sectionData.meta.title.replace(/[/\\?%*:|"<>]/g, "-")
      );

      for (const lecture in sectionData.lectures) {
        const lectureData = sectionData.lectures[lecture];
        const type = sectionData.lectures[lecture].asset.asset_type;
        // console.log(type);

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
            lectureData.title.replace(/[/\\?%*:|"<>]/g, "-")
        );

        if (data.type === "Video" && !data.encrypted) {
          let caption_path = lecturePath;
          lecturePath = lecturePath + ".mp4";
          let dataUrl = data.url;
          let captionUrl = data.caption_url;

          downloadLecture(
            sectionPath,
            lecturePath,
            dataUrl,
            downloader,
            setLectureStatus,
            dispatch,
            lectureData,
            num
          );

          https.get(captionUrl, (res) => {
            const path = `${caption_path + ".vtt"}`;
            const writeStream = fs.createWriteStream(path);

            res.pipe(writeStream);

            writeStream.on("finish", () => {
              writeStream.close();
              console.log("Subtitle Download Completed!");
            });
          });
        }

        if (data.type === "Article" && !data.encrypted) {
          lecturePath = lecturePath + ".html";
          mkdirp(sectionPath).then(() => {
            fs.writeFile(lecturePath, data.url);
            dispatch({
              type: "completed",
            });
          });
        }

        if (data.type === "E-Book" && !data.encrypted) {
          var file_name_array = data.title.split(".");
          var file_extension = file_name_array[file_name_array.length - 1];
          lecturePath = lecturePath + "." + file_extension;
          let dataUrl = data.url;

          dataUrl.forEach((file) =>
            downloadLecture(
              sectionPath,
              lecturePath,
              file.file,
              downloader,
              setLectureStatus,
              dispatch,
              lectureData,
              num
            )
          );
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
              <button
                type="button"
                className="relative -ml-px inline-flex items-center rounded-r-md bg-white px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-10 disabled:opacity-25"
                onClick={() => {
                  setOpen(true);
                }}
                disabled={downloadState.status}
              >
                <span className="sr-only">Detail</span>
                <svg
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z"></path>
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
      {lectureStatus && (
        <CoureseDetail
          open={open}
          setOpen={setOpen}
          lecture={lectureStatus}
          courseId={course.id}
        />
      )}
    </div>
  );
}
