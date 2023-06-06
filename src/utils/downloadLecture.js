import { join } from "path";
const { homedir } = require("os");
import fs, { mkdirp } from "fs-extra";
import { getDownloadSpeed } from "./utils";

export default function downloadLecture(
  sectionPath,
  lecturePath,
  data,
  downloader,
  setLectureStatus,
  dispatch,
  lectureData,
  num
) {
  mkdirp(sectionPath).then(() => {
    const download = downloader.download(data, lecturePath);

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
      console.log("EVENT - Download " + num + " end " + download.status);
    });
  });
}
