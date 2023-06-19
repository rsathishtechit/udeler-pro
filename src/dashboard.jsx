import React, {
  useContext,
  useEffect,
  useReducer,
  useState,
  useRef,
} from "react";
import { DbContext, UdemyContext } from "./context/context";
import CourseCard from "./courseCard";

const { addRxPlugin } = require("rxdb");

import { RxDBUpdatePlugin } from "rxdb/plugins/update";
import Settings from "./settings";
import useAuth from "./hooks/useAuth";

addRxPlugin(RxDBUpdatePlugin);

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
  let { token, setToken } = useContext(UdemyContext);
  let { db } = useContext(DbContext);

  const [_, fetchToken] = useAuth();

  const [loading, setLoading] = useState(true);

  // if (!token) {
  //   token = localStorage.getItem("token");
  // }

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
    console.log(token);
    if (token.length) {
      loadCourses();

      if (state.courses) {
        setLoading(false);
      }
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      (async () => {
        await fetchToken();
      })();
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
                <Settings />
                <div className="px-4 py-6 sm:px-6 lg:pl-8 xl:flex-1 xl:pl-6">
                  <ul role="list" className="divide-y divide-gray-200 shadow">
                    {state.courses.length &&
                      state.courses.map((course) => (
                        <li key={course.id} className="shadow mt-2 ml-2 mr-2">
                          <CourseCard course={course} />
                        </li>
                      ))}
                  </ul>
                </div>
              </div>

              <div className="shrink-0 border-t border-gray-200 px-4 py-6 sm:px-6 lg:w-96 lg:border-l lg:border-t-0 lg:pr-8 xl:pr-6">
                <div
                  id="status"
                  className="border-b border-gray-900/10 pb-12"
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
