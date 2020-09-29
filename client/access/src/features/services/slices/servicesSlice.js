import { createSlice } from "@reduxjs/toolkit";
import { evaluate } from "maslow-shared";
import _ from "lodash";

// Reducer slice that manages service state, including the list of services and
// their ranked order.
export const servicesSlice = createSlice({
  name: "serviceData",
  initialState: {},
  reducers: {
    updateServices: (state, action) => {
      const { rank, services } = action.payload;
      return { ...state, rank, services };
    },
  },
});

export const { updateServices } = servicesSlice.actions;

// Returns all services.
export const selectServices = (state) =>
  state.serviceData && state.serviceData.services
    ? state.serviceData.services
    : {};

// Returns a single service by the specified key.
export const selectService = (state, key) => {
  return (
    state.serviceData &&
    state.serviceData.services &&
    state.serviceData.services[key]
  );
};

// Returns the ranked order of service keys.
export const selectRank = (state) =>
  state.serviceData && state.serviceData.rank ? state.serviceData.rank : [];

// Returns the specified list of service keys in ranked order.
const selectRankedServiceKeys = (state, selectedServiceKeys) => {
  return state.serviceData.rank.filter((serviceKey) =>
    selectedServiceKeys.includes(serviceKey)
  );
};

// Returns a list of service keys, corresponding to services whose formulas
// match the user's survey responses. Note that this assumes the responses have
// already been stored in Redux.
const selectMatchingServiceKeys = (state) => {
  if (!state.serviceData || !state.serviceData.services) {
    return;
  }
  let keysMatchingFormula = [];
  for (const [key, service] of _.entries(state.serviceData.services)) {
    if (!service.formula) {
      continue;
    }
    const evalResponse = evaluate(service.formula, state.responses);
    if (evalResponse.value) {
      keysMatchingFormula.push(key);
    }
  }
  return keysMatchingFormula;
};

// Returns a list of ranked service keys, corresponding to services whose
// formulas match the user's survey responses.
export const selectRankedMatchingServiceKeys = (state) => {
  const matchingServiceKeys = selectMatchingServiceKeys(state);
  if (!matchingServiceKeys) {
    return [];
  }
  return selectRankedServiceKeys(state, matchingServiceKeys);
};

// Returns a list of service keys, corresponding to services that have no
// formula.
const selectNoFormulaServiceKeys = (state) => {
  if (!state.serviceData || !state.serviceData.services) {
    return;
  }
  let noFormulaKeys = [];
  for (const [key, service] of _.entries(state.serviceData.services)) {
    if (!service.formula) {
      noFormulaKeys.push(key);
    }
  }
  return noFormulaKeys;
};

// Returns a list of ranked service keys, corresponding to services that have no
// formula.
export const selectRankedNoFormulaServiceKeys = (state) => {
  const noFormulaKeys = selectNoFormulaServiceKeys(state);
  if (!noFormulaKeys) {
    return [];
  }
  return selectRankedServiceKeys(state, noFormulaKeys);
};

export default servicesSlice.reducer;
