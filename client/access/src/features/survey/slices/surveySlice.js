import { createSlice } from "@reduxjs/toolkit";

export const surveySlice = createSlice({
  name: "survey",
  initialState: [],
  reducers: {
    updateSurvey: (state, action) => {
      state.length = 0; // remove existing state
      action.payload.survey.forEach((surveySection) =>
        state.push(surveySection)
      );
    },
  },
});

export const { updateSurvey } = surveySlice.actions;

/** Returns an array of sections with their question keys. */
export const selectSurvey = (state) => state.survey;

export default surveySlice.reducer;
