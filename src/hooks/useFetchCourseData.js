import React, { useState, useEffect, useContext } from "react";
import { UdemyContext } from "../context/context";

export default function useFetchCourseData(courseId) {
  const [courseData, setCourseData] = useState([]);
  const [lectureCount, setLectureCount] = useState([]);
  let { token } = useContext(UdemyContext);
  if (!token) {
    token = localStorage.getItem("token");
  }

  const fetchCourseData = async () => {
    await fetch(
      `https://www.udemy.com/api-2.0/courses/${courseId}/cached-subscriber-curriculum-items?page_size=10000&q=${Date.now()}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          // Authorization: `Bearer og6TNmps8dGgijC8RpMu09LvcfUXTjdnWjHKBXIR`,
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
        setCourseData(courseData);
        setLectureCount(lectureCount);
      });
  };

  useEffect(() => fetchCourseData, []);

  return [courseData, lectureCount];
}
