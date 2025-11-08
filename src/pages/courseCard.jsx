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

      let sectionPath = join(
        homePath,
        num + "." + sectionData.meta.title.replace(/[/\\?%*:|"<>]/g, "-")
      );

      for (const lecture in sectionData.lectures) {
        const lectureData = sectionData.lectures[lecture];
        const type = sectionData.lectures[lecture].asset.asset_type;

        setLectureStatus((prev) => ({
          ...prev,
          [lectureData.id]: { title: lectureData.title },
        }));

        const data = await fetchLectureData(course.id, lectureData.id, type);

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
    <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all duration-200">
      <div className="p-6">
        <div className="flex gap-6">
          <div className="relative group flex-shrink-0">
            <img
              className="h-40 w-72 object-cover rounded-lg shadow-sm transition-transform duration-200 group-hover:scale-105"
              src={course.image_480x270}
              alt={course.title}
            />
            {downloadState.download && (
              <div className="absolute bottom-2 right-2 bg-white rounded-full p-1.5 shadow-lg">
                <div className="w-10 h-10">
                  <CircularProgressbar
                    value={downloadState.completedPercentage}
                    text={`${parseInt(downloadState.completedPercentage)}%`}
                    styles={{
                      path: { stroke: "#4f46e5" },
                      text: {
                        fill: "#4f46e5",
                        fontSize: "28px",
                        fontWeight: "bold",
                      },
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold text-gray-900 mb-4 line-clamp-2">
              {course.title}
            </h3>
            <div className="flex flex-wrap gap-3 mt-4">
              <button
                type="button"
                className={`inline-flex items-center px-4 py-2.5 rounded-lg text-sm font-medium ${
                  downloadState.download
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                } transition-colors duration-200`}
                onClick={downloadCourse}
                disabled={downloadState.download}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                Download Course
              </button>

              <button
                type="button"
                className={`inline-flex items-center p-2.5 rounded-lg border ${
                  downloadState.pause
                    ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                } transition-colors duration-200`}
                onClick={pauseDownload}
                disabled={downloadState.pause}
                title="Pause Download"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </button>

              <button
                type="button"
                className={`inline-flex items-center p-2.5 rounded-lg border ${
                  downloadState.resume
                    ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                } transition-colors duration-200`}
                onClick={resumeDownload}
                disabled={downloadState.resume}
                title="Resume Download"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </button>

              <button
                type="button"
                className={`inline-flex items-center p-2.5 rounded-lg border ${
                  downloadState.status
                    ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                } transition-colors duration-200`}
                onClick={() => setOpen(true)}
                disabled={downloadState.status}
                title="View Details"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </button>
            </div>
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
