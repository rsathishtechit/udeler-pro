import React, { useContext, useEffect, useReducer, useState } from "react";
import { DbContext, UdemyContext } from "../context";
import CourseCard from "./courseCard";

const initialState = {
  page: 1,
  limit: 10,
  courses: [],
};

function courseReducer(state = initialState, action) {
  switch (action.type) {
    case "load_courses":
      return {
        ...state,
        courses: [...action.payload],
        page: state.page + 1,
      };
  }
}

const Dashboard = () => {
  const [state, dispatch] = useReducer(courseReducer, initialState);
  let { token } = useContext(UdemyContext);
  let { db } = useContext(DbContext);

  const [loading, setLoading] = useState(true);

  async function get() {
    db.settings
      .find()
      .sort({
        videoQuality: "asc",
      })
      .$.subscribe(function (settings) {
        if (!settings) {
          heroesList.innerHTML = "Loading..";
          return;
        }
        console.log("observable fired");
        console.dir(settings);
      });

    const course = db.courses
      .find()
      .exec()
      .then((documents) => console.dir(documents));
    console.log("course", course);
  }

  if (!token) {
    token = localStorage.getItem("token");
  }
  const loadCourses = async () => {
    await fetch(
      `https://udemy.com/api-2.0/users/me/subscribed-courses?&page=${state.page}&page_size=${state.limit}&ordering=-last_accessed`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
      .then((res) => res.json())
      .then((res) => {
        dispatch({
          type: "load_courses",
          payload: [...state.courses, ...res.results],
        });
      })
      .catch(console.error);
  };
  useEffect(() => {
    loadCourses();
    if (state.courses) {
      setLoading(false);
    }
  }, []);

  return (
    <>
      {loading ? (
        <>Loading</>
      ) : (
        <div className="mb-4 flex-shrink-0 sm:mb-0 sm:mr-4 overflow-hidden rounded-md bg-white ">
          <button onClick={() => get()}> Click</button>
          <ul role="list" className="divide-y divide-gray-200 shadow">
            {state.courses &&
              state.courses.map((course) => (
                <li key={course.id} className="shadow mt-2 ml-2 mr-2">
                  <CourseCard course={course} />
                </li>
              ))}
          </ul>
          <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
            <div>
              <button
                onClick={loadCourses}
                type="submit"
                className="flex w-full mb-5 justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Load more courses
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Dashboard;
