import React, {
  useContext,
  useEffect,
  useReducer,
  useState,
  useRef,
} from "react";
import { DbContext, UdemyContext } from "../context";
import CourseCard from "./courseCard";

import CoureseDetail from "./courseDetail";

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
  const courseDetailRef = useRef(null);
  const [courseDetail, setCourseDetail] = useState(null);

  const [state, dispatch] = useReducer(courseReducer, initialState);
  let { token } = useContext(UdemyContext);
  let { db } = useContext(DbContext);
  // console.log(db);

  const [loading, setLoading] = useState(true);
  const [defaultSettings, setDefaultSettings] = useState(true);

  // async function get() {
  //   if (db) {
  //     db.settings
  //       .find()
  //       .exec()
  //       .then((documents) => console.log("documents", documents));
  //     db.courses
  //       .find()
  //       .exec()
  //       .then((documents) => console.log("courses", documents));
  //   }
  // }
  // get();

  useEffect(() => {
    db.settings
      .findOne({
        selector: {
          id: {
            $eq: "1",
          },
        },
      })
      .exec()
      .then((documents) => setDefaultSettings(documents));
  }, [db]);

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
        <>
          <div className="flex min-h-full flex-col">
            {/* 3 column wrapper */}
            <div className="w-full grow lg:flex xl:px-2">
              {/* Left sidebar & main wrapper */}
              <div className="flex-1 xl:flex px-4 py-6 sm:px-6 lg:pr-8 xl:pr-6">
                <div className="border-b border-gray-900/10 pb-12">
                  <h2 className="text-base font-semibold leading-7 text-gray-900">
                    Settings
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-gray-600">
                    Use a permanent address where you can receive mail.
                  </p>

                  <div className="col-span-full">
                    <label
                      htmlFor="first-name"
                      className="block text-sm font-medium leading-6 text-gray-900"
                    >
                      First name
                    </label>
                    <div className="mt-2">
                      <input
                        type="text"
                        name="first-name"
                        id="first-name"
                        autoComplete="given-name"
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      />
                    </div>
                  </div>
                </div>

                <div className="px-4 py-6 sm:px-6 lg:pl-8 xl:flex-1 xl:pl-6">
                  <ul role="list" className="divide-y divide-gray-200 shadow">
                    {state.courses &&
                      state.courses.map((course) => (
                        <li key={course.id} className="shadow mt-2 ml-2 mr-2">
                          <CourseCard
                            course={course}
                            defaultSettings={defaultSettings}
                            courseDetailRef={courseDetailRef}
                          />
                        </li>
                      ))}
                  </ul>
                </div>
              </div>

              <div className="shrink-0 border-t border-gray-200 px-4 py-6 sm:px-6 lg:w-96 lg:border-l lg:border-t-0 lg:pr-8 xl:pr-6">
                <div
                  id="status"
                  className="border-b border-gray-900/10 pb-12"
                  ref={courseDetailRef}
                ></div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Dashboard;
