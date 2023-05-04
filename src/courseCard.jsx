import React, { useContext, useState } from "react";

import { UdemyContext } from "../context";

import { mkdirp } from "fs-extra";
import { join } from "path";
import Downloader from "mt-files-downloader";
const { homedir } = require("os");

export default function CourseCard({ course }) {
  const [loading, setLoading] = useState(false);
  const downloader = new Downloader();

  let { token, url } = useContext(UdemyContext);

  const fetchCourseData = async () => {
    await fetch(
      `https://www.udemy.com/api-2.0/courses/${
        course.id
      }/cached-subscriber-curriculum-items?page_size=10000&q=${Date.now()}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
      .then((res) => res.json())
      .then(({ results }) => {
        const courseData = {};
        let current;
        results.forEach((item, index) => {
          if (item._class === "chapter") {
            // debugger;
            current = index;
            courseData[index] = {};
            courseData[index]["meta"] = item;
          } else if (item._class === "lecture") {
            if (courseData[current]["lectures"] === undefined)
              courseData[current]["lectures"] = {};
            courseData[current]["lectures"][index] = item;
          }
        });
        let homePath = join(homedir(), `Downloads/udeler/${course.title}`);
        for (const section in courseData) {
          const sectionData = courseData[section];
          let sectionPath = join(homePath, sectionData.meta.title);

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
                    Authorization: `Bearer ${token}`,
                  },
                }
              )
                .then((res) => res.json())
                .then(({ asset }) => {
                  let lecturePath = join(sectionPath, asset.filename);
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
                      threadsCount: 5, // Default: 2, Set the total number of download threads
                      timeout: 5000, // Default: 5000, If no data is received, the download times out (milliseconds)
                      range: "0-100", // Default: 0-100, Control the part of file that needs to be downloaded.
                    });
                    download.start();
                  });
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
          className="h-52 w-4/12 w-full border border-gray-300 bg-white text-gray-300"
          src={course.image_480x270}
          alt=""
        />
        <div className="px-6 py-4 ">
          <h4 className="text-lg font-bold">{course.title}</h4>
          <div className="flex items-center gap-x-4 mt-12">
            <button
              onClick={fetchCourseData}
              className=" rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:block"
            >
              Download
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
