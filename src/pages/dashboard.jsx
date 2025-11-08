import React, { useContext, useEffect, useReducer, useState } from "react";
import { UdemyContext } from "../context/context";
import CourseCard from "./courseCard";
import Settings from "./settings";
import useAuth from "../hooks/useAuth";

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
  const { fetchToken } = useAuth();

  const [loading, setLoading] = useState(true);

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
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="mt-4 text-lg font-medium text-gray-700">
              Loading your courses...
            </p>
          </div>
        </div>
      ) : (
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="lg:w-1/4">
                <div className="bg-white rounded-xl shadow-sm p-6 sticky top-8">
                  <Settings />
                </div>
              </div>

              <div className="lg:w-3/4">
                <div className="grid gap-6">
                  {state.courses.length > 0 ? (
                    state.courses.map((course) => (
                      <div key={course.id}>
                        <CourseCard course={course} />
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-gray-500">No courses found</p>
                    </div>
                  )}

                  {state.courses.length > 0 && (
                    <button
                      onClick={loadCourses}
                      className="w-full px-4 py-3 text-base font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                    >
                      Load more courses
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Dashboard;
