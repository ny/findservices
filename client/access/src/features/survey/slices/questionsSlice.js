import { createSlice } from "@reduxjs/toolkit";

export const questionsSlice = createSlice({
  name: "questions",
  initialState: {
    // Will include keys representing the questions (which will match the keys
    // in the answers slice of the state) and values with metadata about the
    // question.
  },
  reducers: {
    updateQuestions: (state, action) => {
      Object.assign(state, action.payload.questions);
    },
  },
});

export const { updateQuestions } = questionsSlice.actions;

/** Returns a list of questions and their type (boolean, number, or currency). */
export const selectQuestions = (state) => state.questions;

export default questionsSlice.reducer;
