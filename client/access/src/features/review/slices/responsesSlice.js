import { createSlice } from "@reduxjs/toolkit";

export const responsesSlice = createSlice({
  name: "responses",
  initialState: {
    // Will include responses for questions including:
    // HOUSEHOLD_SIZE
    // ADULTS_65_PLUS
    // CHILDREN_13_17
    // CHILDREN_06_12
    // CHILDREN_00_05
    // HOUSEHOLD_INCOME
    // IS_EMPLOYED
    // IS_MILITARY
    // IS_DISABLED
    // IS_STUDENT
    // but should start empty.
  },
  reducers: {
    updateResponse: (state, action) => {
      Object.assign(state, action.payload);
    },
    updateResponses: (state, action) => {
      Object.assign(state, action.payload.responses);
    },
    deleteResponse: (state, action) => {
      delete state[action.payload];
    },
    clearResponses: () => {
      return {};
    },
  },
});

export const {
  updateResponse,
  updateResponses,
  clearResponses,
  deleteResponse,
} = responsesSlice.actions;

/** Returns a single response given a question key. */
export const selectResponse = (state, key) => state.responses[key];

/** Returns all of the entered responses. */
export const selectResponses = (state) => state.responses;

export default responsesSlice.reducer;
