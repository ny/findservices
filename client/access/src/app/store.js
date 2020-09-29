import { configureStore } from "@reduxjs/toolkit";
import globalFlagsReducer from "app/globalFlagsSlice";
import reportReducer from "features/report/slices/reportSlice";
import responsesReducer from "features/review/slices/responsesSlice";
import serviceDataReducer from "features/services/slices/servicesSlice";
import questionsReducer from "features/survey/slices/questionsSlice";
import surveyReducer from "features/survey/slices/surveySlice";

export default configureStore({
  reducer: {
    flags: globalFlagsReducer,
    survey: surveyReducer,
    questions: questionsReducer,
    responses: responsesReducer,
    serviceData: serviceDataReducer,
    report: reportReducer,
  },
});
