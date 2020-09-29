/**
 * These fixtures correspond to data returned by calls to the API.
 */

/** The survey, containing ordered section and question keys */
export const mockSurvey = [
  { SECTION_HOUSEHOLD: ["HOUSEHOLD_SIZE", "ADULTS_65_PLUS"] },
  { SECTION_HOUSEHOLD_INCOME: ["HOUSEHOLD_INCOME"] },
];

/** A dictionary of questions, including types and translated text */
export const mockQuestions = {
  HOUSEHOLD_SIZE: {
    type: "NUMBER",
    resources: {
      en: {
        text: "How many people live at your current address?",
      },
    },
  },
  ADULTS_65_PLUS: {
    type: "BOOLEAN",
    resources: {
      en: {
        text: "Are there adults aged 65 or older at your address?",
      },
    },
  },
  HOUSEHOLD_INCOME: {
    type: "CURRENCY",
    resources: {
      en: {
        text: "What is your typical household monthly income per month?",
      },
    },
  },
};

/** A dictionary of services */
export const mockServices = {
  rank: ["SNAP", "DOL_UA", "DOL_PUA", "EAA"],
  services: {
    DOL_UA: {
      formula: "=NOT(IS_EMPLOYED)",
    },
    DOL_PUA: {
      formula: "=NOT(IS_EMPLOYED)",
    },
    SNAP: {
      formula: "=HOUSEHOLD_INCOME <= (1345 + HOUSEHOLD_SIZE * 737)",
    },
    EAA: {},
  },
};

/**
 * The entire catalog returned by the API, including the survey, sections,
 * questions and services
 */
export const mockCatalog = {
  survey: mockSurvey,
  questions: mockQuestions,
  services: mockServices,
};
