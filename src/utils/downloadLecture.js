import { join } from "path";
const { homedir } = require("os");
import fs, { mkdirp } from "fs-extra";
import { getDownloadSpeed } from "./utils";

export default function fetchLectureData(
  courseId,
  courseTitle,
  downloader,
  dispatch,
  courseData
) {
  let homePath = join(homedir(), `Downloads/udeler/${courseTitle}`);
  let num = 0;

  for (const section in courseData) {
    num++;
    const sectionData = courseData[section];
    console.log("sectionData", sectionData);

    let sectionPath = join(
      homePath,
      num + "." + sectionData.meta.title.replace(/[/\\?%*:|"<>]/g, "-")
    );

    for (const lecture in sectionData.lectures) {
      const lectureData = sectionData.lectures[lecture];
      if (lectureData.asset.asset_type.toLowerCase() === "video") {
        fetch(
          `https://udemy.com/api-2.0/users/me/subscribed-courses/${courseId}/lectures/${
            lectureData.id
          }?fields[lecture]=asset,supplementary_assets&fields[asset]=stream_urls,download_urls,captions,title,filename,data,body,media_sources,media_license_token&q=${Date.now()}`,
          {
            headers: {
              Authorization: `Bearer og6TNmps8dGgijC8RpMu09LvcfUXTjdnWjHKBXIR`,
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
}
