import "@testing-library/jest-dom/extend-expect";
import isResponseMissing from "./isResponseMissing";

describe("isResponseMissing", () => {
  it("returns false when all questions are present in responses", () => {
    const survey = [
      {
        HOUSEHOLD_SECTION: [
          "HOUSEHOLD_SIZE",
          "ADULTS_65_PLUS",
          "CHILDREN_00_05",
        ],
      },
      {
        SECTION_HOUSEHOLD_INCOME: ["HOUSEHOLD_INCOME"],
      },
      {
        SECTION_YOURSELF: ["IS_EMPLOYED"],
      },
    ];
    const responses = {
      HOUSEHOLD_SIZE: 4,
      ADULTS_65_PLUS: true,
      CHILDREN_00_05: false,
      HOUSEHOLD_INCOME: 1000,
      IS_EMPLOYED: false,
    };
    expect(isResponseMissing(survey, responses)).toBe(false);
  });

  it("returns true when questions are not present in responses", () => {
    const survey = [
      {
        HOUSEHOLD_SECTION: [
          "HOUSEHOLD_SIZE",
          "ADULTS_65_PLUS",
          "CHILDREN_00_05",
        ],
      },
      {
        SECTION_HOUSEHOLD_INCOME: ["HOUSEHOLD_INCOME"],
      },
      {
        SECTION_YOURSELF: ["IS_EMPLOYED"],
      },
    ];
    const responses = {
      HOUSEHOLD_SIZE: 4,
      ADULTS_65_PLUS: true,
      CHILDREN_00_05: false,
      HOUSEHOLD_INCOME: 1000,
    };
    expect(isResponseMissing(survey, responses)).toBe(true);
  });
});
