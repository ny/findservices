import { createSlice } from "@reduxjs/toolkit";

export const i18nStates = {
  NOT_INITIALIZED: "NOT_INITIALIZED",
  INITIALIZED: "INITIALIZED",
  FAILED: "FAILED",
};

/**
 * A Redux slice containing global flags that apply to the entire application,
 * as opposed to state that applies to specific application features. It is
 * meant to address development-specific state tracking, any user-facing
 * information should be stored in the appropriate `features/` slice.
 */
export const globalFlagsSlice = createSlice({
  name: "flags",
  initialState: { i18nState: i18nStates.NOT_INITIALIZED },
  reducers: {
    setI18nState: (state, { payload: loadingState }) => {
      state.i18nState = loadingState;
    },
  },
});

export const selectGlobalFlags = (state) => state.flags;

export const { setI18nState } = globalFlagsSlice.actions;

export default globalFlagsSlice.reducer;
