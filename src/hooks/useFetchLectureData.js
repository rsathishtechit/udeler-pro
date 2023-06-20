import { useContext } from "react";
import { assetTypes } from "../constants/assetTypes";
import { DefaultSettingsContext, UdemyContext } from "../context/context";
import { LANGUAGES, VIDEO_QUALITY } from "../constants/settings";

export default function useFetchLectureData() {
  let { token } = useContext(UdemyContext);
  if (!token) {
    token = localStorage.getItem("token");
  }
  let { defaultSettings } = useContext(DefaultSettingsContext);
  const fetchLectureData = async (courseId, lectureId, type) => {
    const lectureData = await fetch(
      `https://udemy.com/api-2.0/users/me/subscribed-courses/${courseId}/lectures/${lectureId}?fields[lecture]=asset,supplementary_assets&fields[asset]=stream_urls,download_urls,captions,title,filename,data,body,media_sources,media_license_token&q=${Date.now()}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const data = await lectureData.json();
    const response = { type };
    console.log("lectureData", data);

    switch (type) {
      case assetTypes.VIDEO: {
        let videos = data.asset.media_sources.filter(
          (asset) => asset.type === "video/mp4"
        );

        let caption_url;

        let captions = data.asset.captions.filter(
          (caption) => caption.locale_id === defaultSettings.language.name
        );

        if (captions.length === 0) {
          caption_url = false;
        } else {
          caption_url = captions[0].url;
        }
        if (videos.length === 0) {
          if (data.asset.stream_urls) {
            videos = data.asset.stream_urls["Video"]
              .filter((asset) => asset.type === "video/mp4")
              .map((video) => ({ ...video, src: video.file }));
          } else {
            return { ...response, encrypted: true };
          }
        }

        if (videos.length === 0) return { ...response, encrypted: true };

        let url;

        if (defaultSettings.videoQuality.name === VIDEO_QUALITY[0].name) {
          url = videos[0].src;
        } else if (
          defaultSettings.videoQuality.name === VIDEO_QUALITY[3].name
        ) {
          url = videos[videos.length - 1].src;
        } else {
          const video = videos.filter(
            (video) => video.label === defaultSettings.videoQuality.name
          );
          if (!video) {
            url = video;
          }
        }

        if (!url) {
          url = videos[0].src;
        }

        return {
          encrypted: false,
          url,
          caption_url,
          ...response,
        };
      }
      case assetTypes.EBOOK:
        return {
          ...response,
          url: data.asset.download_urls[assetTypes.EBOOK],
          title: data.asset.title,
        };
      case assetTypes.ARTICLE:
        return {
          ...response,
          url: data.asset.body,
        };
      default:
        return { type: assetTypes.INVALID };
    }
  };

  return [fetchLectureData];
}
