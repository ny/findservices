import { screen } from "@testing-library/react";
import Checks from "features/checks/components/Checks";
import { axe, toHaveNoViolations } from "jest-axe";
import { renderWith } from "maslow-shared/src/util/testing";
import React from "react";

expect.extend(toHaveNoViolations);

describe("The Checks component", () => {
  describe("when all service formulas are valid and ranked", () => {
    let container = null;

    beforeEach(() => {
      const initialState = {
        survey: [{ SECTION_HOUSEHOLD: ["HOUSEHOLD_SIZE", "ADULTS_65_PLUS"] }],
        serviceData: {
          rank: ["SNAP", "DOL_UA", "VICTIM_COMP"],
          services: {
            DOL_UA: {
              formula: "=NOT(IS_EMPLOYED)",
            },
            SNAP: {
              formula: "=HOUSEHOLD_INCOME <= (1345 + HOUSEHOLD_SIZE * 737)",
            },
            VICTIM_COMP: {
              formula: "",
            },
          },
        },
        questions: {
          HOUSEHOLD_SIZE: {
            type: "NUMBER",
          },
          HOUSEHOLD_INCOME: {
            type: "CURRENCY",
          },
          IS_EMPLOYED: {
            type: "BOOLEAN",
          },
        },
      };
      const options = {
        state: initialState,
      };
      ({ container } = renderWith(<Checks />, options));
    });

    it("renders headers", async () => {
      const heading = screen.getByRole("heading", {
        name: "checks.services.title",
      });
      const formulasHeader = screen.getByRole("heading", {
        name: "checks.services.formulas.title",
      });
      const rankingHeader = screen.getByRole("heading", {
        name: "checks.services.ranking.title",
      });

      expect(heading).toBeInTheDocument();
      expect(formulasHeader).toBeInTheDocument();
      expect(rankingHeader).toBeInTheDocument();
    });

    it("has no a11y violations", async () => {
      expect(await axe(container)).toHaveNoViolations();
    });

    it("renders service cards in order with confirmation of valid formula", async () => {
      const [card1, card2, card3] = screen.getAllByRole("listitem");

      // Service with formula with number and currency questions
      expect(card1).toHaveTextContent("SNAP.name");
      expect(card1).toHaveTextContent(
        "HOUSEHOLD_INCOME <= (1345 + HOUSEHOLD_SIZE * 737)"
      );
      expect(card1).toHaveTextContent("checks.noErrors");

      // Service with formula with boolean question
      expect(card2).toHaveTextContent("DOL_UA.name");
      expect(card2).toHaveTextContent("=NOT(IS_EMPLOYED)");
      expect(card2).toHaveTextContent("checks.noErrors");

      // Service without a formula
      expect(card3).toHaveTextContent("VICTIM_COMP.name");
      expect(card3).toHaveTextContent("checks.services.formulas.noFormula");
      expect(card3).toHaveTextContent("checks.noErrors");
    });

    it("renders card with valid ranking", async () => {
      const cards = screen.getAllByRole("listitem");
      expect(cards).toHaveLength(5);
      const rankingCard = cards[3];
      expect(rankingCard).toHaveTextContent("checks.noErrors");
      expect(rankingCard).toHaveTextContent(
        "checks.services.ranking.cardTitle"
      );
    });
  });

  describe("when service formulas are invalid and not all services are ranked", () => {
    let container = null;

    beforeEach(() => {
      const initialState = {
        survey: [{ SECTION_HOUSEHOLD: ["HOUSEHOLD_SIZE", "ADULTS_65_PLUS"] }],
        serviceData: {
          rank: ["SNAP", "DOL_UA", "VICTIM_COMP"],
          services: {
            DOL_UA: {
              formula: "=IFS(IS_EMPLOYED)",
            },
            SNAP: {
              formula: "=?",
            },
            VICTIM_COMP: {
              formula: "=DOES_NOT_EXIST",
            },
            DOES_NOT_EXIST: {
              formula: "=IFS(IS_EMPLOYED)",
            },
          },
        },
        questions: {
          HOUSEHOLD_SIZE: {
            type: "NUMBER",
          },
          HOUSEHOLD_INCOME: {
            type: "CURRENCY",
          },
          IS_EMPLOYED: {
            type: "BOOLEAN",
          },
        },
      };
      const options = {
        state: initialState,
      };
      ({ container } = renderWith(<Checks />, options));
    });

    it("renders headers", async () => {
      const heading = screen.getByRole("heading", {
        name: "checks.services.title",
      });
      const formulasHeader = screen.getByRole("heading", {
        name: "checks.services.formulas.title",
      });
      const rankingHeader = screen.getByRole("heading", {
        name: "checks.services.ranking.title",
      });

      expect(heading).toBeInTheDocument();
      expect(formulasHeader).toBeInTheDocument();
      expect(rankingHeader).toBeInTheDocument();
    });

    it("has no a11y violations", async () => {
      expect(await axe(container)).toHaveNoViolations();
    });

    it("renders cards in order with error messages", async () => {
      const [card1, card2, card3] = screen.getAllByRole("listitem");

      // Service with formula with lexer error
      expect(card1).toHaveTextContent("SNAP.name");
      expect(card1).toHaveTextContent("=?");
      expect(card1).toHaveTextContent(
        "Errors were found while tokenizing input: unexpected character: ->?<- at offset: 0, skipped 1 characters."
      );

      // Service with formula with parser error
      expect(card2).toHaveTextContent("DOL_UA.name");
      expect(card2).toHaveTextContent("IFS(IS_EMPLOYED)");
      expect(card2).toHaveTextContent("Error when calling IFS!");

      // Service with formula with identifier error
      expect(card3).toHaveTextContent("VICTIM_COMP.name");
      expect(card3).toHaveTextContent("DOES_NOT_EXIST");
      expect(card3).toHaveTextContent(
        "Errors detected! Unknown variable: 'DOES_NOT_EXIST'"
      );
    });

    it("renders card with invalid ranking", async () => {
      const cards = screen.getAllByRole("listitem");
      expect(cards).toHaveLength(5);
      const rankingCard = cards[3];
      expect(rankingCard).toHaveTextContent(
        "checks.services.ranking.cardTitle"
      );
      expect(rankingCard).toHaveTextContent(
        "checks.services.ranking.missingServices: DOES_NOT_EXIST"
      );
    });
  });

  describe("when all question keys in the survey have corresponding questions", () => {
    let container = null;

    beforeEach(() => {
      const initialState = {
        survey: [
          { SECTION_HOUSEHOLD: ["HOUSEHOLD_SIZE", "ADULTS_65_PLUS"] },
          { SECTION_YOURSELF: ["IS_EMPLOYED"] },
        ],
        serviceData: {
          rank: ["SNAP"],
          services: {
            SNAP: {
              formula: "=HOUSEHOLD_INCOME <= (1345 + HOUSEHOLD_SIZE * 737)",
              informationUrl: "url",
            },
          },
        },
        questions: {
          HOUSEHOLD_SIZE: {
            type: "NUMBER",
          },
          ADULTS_65_PLUS: {
            type: "CURRENCY",
          },
          IS_EMPLOYED: {
            type: "BOOLEAN",
          },
        },
      };
      const options = {
        state: initialState,
      };
      ({ container } = renderWith(<Checks />, options));
    });

    it("displays a card indicating no errors were found", async () => {
      expect(await axe(container)).toHaveNoViolations();

      const surveyHeading = screen.getByRole("heading", {
        name: "checks.survey.title",
      });
      expect(surveyHeading).toBeInTheDocument();

      // Ensuring all sections questions mentioned in the survey list actually
      // exist in the questions dictionaries.
      const cards = screen.getAllByRole("listitem");
      expect(cards).toHaveLength(3);
      const structureValidation = cards[2];
      expect(structureValidation).toHaveTextContent(
        "checks.survey.structure.questionCardTitle"
      );
      expect(structureValidation).toHaveTextContent("checks.noErrors");
    });
  });

  describe("when some question keys in the survey do not have corresponding questions", () => {
    let container = null;

    beforeEach(() => {
      const initialState = {
        survey: [
          { SECTION_HOUSEHOLD: ["HOUSEHOLD_SIZE", "ADULTS_65_PLUS"] },
          { SECTION_YOURSELF: ["IS_EMPLOYED", "DOES_NOT_EXIST"] },
        ],
        serviceData: {
          rank: ["SNAP"],
          services: {
            SNAP: {
              formula: "=HOUSEHOLD_INCOME <= (1345 + HOUSEHOLD_SIZE * 737)",
              informationUrl: "url",
            },
          },
        },
        questions: {
          HOUSEHOLD_SIZE: {
            type: "NUMBER",
          },
          ADULTS_65_PLUS: {
            type: "CURRENCY",
          },
          IS_EMPLOYED: {
            type: "BOOLEAN",
          },
        },
      };
      const options = {
        state: initialState,
      };
      ({ container } = renderWith(<Checks />, options));
    });

    it("displays a card indicating errors were found", async () => {
      expect(await axe(container)).toHaveNoViolations();

      const surveyHeading = screen.getByRole("heading", {
        name: "checks.survey.title",
      });
      expect(surveyHeading).toBeInTheDocument();

      // Confirm that the  survey validation card has an error message.
      const cards = screen.getAllByRole("listitem");
      expect(cards).toHaveLength(3);
      const structureValidation = cards[2];
      expect(structureValidation).toHaveTextContent(
        "checks.survey.structure.questionCardTitle"
      );
      expect(structureValidation).toHaveTextContent(
        "checks.survey.structure.missingQuestions: DOES_NOT_EXIST"
      );
    });
  });
});
