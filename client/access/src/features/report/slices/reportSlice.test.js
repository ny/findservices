import "@testing-library/jest-dom/extend-expect";
import reduceReport, {
  toggleAddedToReport,
  selectSelectedServices,
  clearReport,
  selectReport,
} from "features/report/slices/reportSlice";

describe("Report slice", () => {
  it("has an empty initial state", () => {
    expect(reduceReport(undefined, { type: undefined })).toEqual({});
  });

  it("toggles the service's presence in the report", () => {
    const serviceKey = "DOL_PUA";
    const state = reduceReport(
      {},
      {
        type: toggleAddedToReport.type,
        payload: serviceKey,
      }
    );
    expect(state).toEqual({ DOL_PUA: true });

    const newState = reduceReport(state, {
      type: toggleAddedToReport.type,
      payload: serviceKey,
    });
    expect(newState).toEqual({ DOL_PUA: false });
  });

  it("clears responses", () => {
    const state = reduceReport(
      {},
      {
        type: toggleAddedToReport.type,
        payload: "DOL_PUA",
      }
    );
    expect(
      reduceReport(state, {
        type: clearReport.type,
      })
    ).toEqual({});
  });

  it("returns report from selectors", () => {
    const state = {
      report: { DOL_PUA: true },
    };

    expect(selectSelectedServices(state)).toEqual(["DOL_PUA"]);
    expect(selectReport(state)).toEqual({ DOL_PUA: true });
  });
});
