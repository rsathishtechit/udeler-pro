export const initialState = {
  download: false,
  pause: true,
  resume: true,
  totalLectures: 0,
  completedLectures: 0,
  completedPercentage: 0,
};

export function downloadReducer(state = initialState, action) {
  switch (action.type) {
    case "download":
      return {
        ...state,
        download: !state.download,
        pause: !state.pause,
      };
    case "pause":
      return {
        ...state,
        pause: !state.pause,
        resume: !state.resume,
      };
    case "resume":
      return {
        ...state,
        resume: !state.resume,
        pause: !state.pause,
      };
    case "total":
      return {
        ...state,
        totalLectures: action.payload,
      };
    case "completed":
      const current = {
        ...state,
        completedLectures: state.completedLectures + 1,
      };
      return {
        ...current,
        completedPercentage:
          (current.completedLectures / current.totalLectures) * 100,
      };
    default:
      return state;
  }
}
