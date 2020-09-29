import { createSlice } from "@reduxjs/toolkit";

// Create reducer slice for handling the Report state.
export const reportSlice = createSlice({
  name: "report",
  initialState: {
    // indicates if a service will be included in the report, e.g.
    // DOL_PA
    // DOL_UA
    // but should start empty
  },
  reducers: {
    toggleAddedToReport: (state, action) => {
      state[action.payload] = !state[action.payload];
    },
    clearReport: () => {
      return {};
    },
  },
});

export const { toggleAddedToReport, clearReport } = reportSlice.actions;

export const selectReport = (state) => state.report;

export const selectSelectedServices = (state) => {
  return Object.keys(state.report).filter((key) => {
    return state.report[key];
  });
};

export default reportSlice.reducer;
