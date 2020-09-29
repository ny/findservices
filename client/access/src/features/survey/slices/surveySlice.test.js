import "@testing-library/jest-dom/extend-expect";
import reduceSurvey, {
  selectSurvey,
  updateSurvey,
} from "features/survey/slices/surveySlice";

test("initial state", () => {
  expect(reduceSurvey(undefined, { type: undefined })).toEqual([]);
});

test("survey update", () => {
  const survey = [
    { SECTION_HOUSEHOLD: ["HOUSEHOLD_SIZE", "ADULTS_65_PLUS"] },
    { SECTION_HOUSEHOLD_INCOME: ["HOUSEHOLD_INCOME"] },
  ];
  const newState = reduceSurvey([], {
    type: updateSurvey.type,
    payload: {
      survey: survey,
    },
  });
  expect(newState).toEqual(survey);
  expect(
    reduceSurvey(newState, {
      type: updateSurvey.type,
      payload: {
        survey: survey,
      },
    })
  ).toEqual(survey);
});

describe("using selector", () => {
  const state = {
    survey: [
      { SECTION_HOUSEHOLD: ["HOUSEHOLD_SIZE", "ADULTS_65_PLUS"] },
      { SECTION_HOUSEHOLD_INCOME: ["HOUSEHOLD_INCOME"] },
    ],
  };

  it("selects survey", async () => {
    const observed = selectSurvey(state);
    expect(observed).toEqual(state.survey);
  });
});
