import React, { useContext, useState } from "react";
import { UdemyContext } from "../context";

export default function CourseCard({ course }) {
  const [loading, setLoading] = useState(false);

  const { token, url } = useContext(UdemyContext);

  const fetchCourseData = async () => {
    await fetch(
      `https://www.udemy.com/api-2.0/courses/${course.id}/cached-subscriber-curriculum-items?page_size=10000`,
      {
        headers: {
          Authorization: "Bearer " + `QwroezJaZevXhGjn6sd885D77HfhJO0XW1WayESi`,
        },
      }
    )
      .then((res) => res.json())
      .then(({ results }) => {
        const data = {};
        let current;
        results.forEach((item, index) => {
          if (item._class === "chapter") {
            // debugger;
            current = index;
            data[index] = {};
            data[index]["meta"] = item;
          } else if (item._class === "lecture") {
            if (data[current]["lectures"] === undefined)
              data[current]["lectures"] = {};
            data[current]["lectures"][index] = item;
          }
        });
        console.log(data);
      });
  };

  return (
    <>
      <div className="flex gap-x-4">
        <img
          className="h-20 w-20 flex-none bg-gray-50"
          src={course.image_480x270}
          alt=""
        />
        <div className="min-w-0 flex-auto">
          <p className="text-sm font-semibold leading-6 text-gray-900">
            {course.title}
          </p>
        </div>
        <div className="flex flex-none items-center gap-x-4">
          <button
            onClick={fetchCourseData}
            className="hidden rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:block"
          >
            Download
          </button>
        </div>
      </div>
    </>
  );
}
