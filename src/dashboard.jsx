import React, { useContext, useEffect, useState } from "react";
import { UdemyContext } from "../context";
import CourseCard from "./courseCard";
const Dashboard = () => {
  const [courses, setCourses] = useState([]);
  const { token, url } = useContext(UdemyContext);
  useEffect(() => {
    fetch(`https://udemy.com/api-2.0/users/me/subscribed-courses`, {
      headers: {
        Authorization: "Bearer " + `QwroezJaZevXhGjn6sd885D77HfhJO0XW1WayESi`,
      },
    })
      .then((res) => res.json())
      .then((data) => setCourses(data.results));
  }, []);
  return (
    <ul role="list" className="divide-y divide-gray-100">
      {courses &&
        courses.map((course) => (
          <li key={course.id} className="flex justify-between gap-x-6 py-5">
            <CourseCard course={course} />
          </li>
        ))}
    </ul>
  );
};

export default Dashboard;
