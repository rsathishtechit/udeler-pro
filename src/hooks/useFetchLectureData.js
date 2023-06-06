import { useContext } from "react";
import { assetTypes } from "../constants/assetTypes";
import { UdemyContext } from "../../context";
export default function useFetchLectureData() {
  let { token } = useContext(UdemyContext);
  if (!token) {
    token = localStorage.getItem("token");
  }

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

    switch (type) {
      case assetTypes.VIDEO: {
        let videos = data.asset.media_sources.filter(
          (asset) => asset.type === "video/mp4"
        );
        if (videos.length === 0) return { ...response, encrypted: true };
        return { encrypted: false, url: videos[0].src, ...response };
      }
      case assetTypes.EBOOK:
        return {
          ...response,
          url: data.asset.download_urls[assetTypes.EBOOK],
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
