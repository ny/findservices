import _ from "lodash";

const fixture = {
  survey: [
    {
      SECTION_YOURSELF: ["IS_EMPLOYED"],
    },
    {
      SECTION_HOUSEHOLD: [
        "HOUSEHOLD_SIZE",
        "HOUSEHOLD_INCOME",
        "ADULTS_65_PLUS",
        "CHILDREN_13_17",
        "CHILDREN_06_12",
        "CHILDREN_00_05",
      ],
    },
    {
      SECTION_SITUATION: [
        "IS_PREGNANT",
        "IS_STUDENT",
        "IS_DISABLED",
        "IS_MILITARY",
      ],
    },
  ],
  questions: {
    IS_EMPLOYED: {
      type: "BOOLEAN",
    },
    IS_PREGNANT: {
      type: "BOOLEAN",
    },
    CHILDREN_06_12: {
      type: "BOOLEAN",
    },
    IS_DISABLED: {
      type: "BOOLEAN",
    },
    CHILDREN_00_05: {
      type: "BOOLEAN",
    },
    IS_MILITARY: {
      type: "BOOLEAN",
    },
    HOUSEHOLD_SIZE: {
      type: "NUMBER",
    },
    CHILDREN_13_17: {
      type: "BOOLEAN",
    },
    IS_STUDENT: {
      type: "BOOLEAN",
    },
    ADULTS_65_PLUS: {
      type: "BOOLEAN",
    },
    HOUSEHOLD_INCOME: {
      type: "CURRENCY",
    },
  },
};

Object.freeze(fixture);

export function toSectionKeys(survey = fixture.survey) {
  return _(survey)
    .map((section) => _(section).keys().first())
    .value();
}

export default fixture;
