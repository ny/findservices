import "@testing-library/jest-dom/extend-expect";
import { screen } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import React from "react";
import ReviewSection from "features/review/components/ReviewSection";
import { renderWith } from "maslow-shared/src/util/testing";
import userEvent from "@testing-library/user-event";

expect.extend(toHaveNoViolations);

describe("summary section", () => {
  describe("with all responses", () => {
    beforeEach(() => {
      const initialState = {
        survey: [
          {
            SECTION_HOUSEHOLD: [
              "HOUSEHOLD_SIZE",
              "ADULTS_65_PLUS",
              "CHILDREN_00_05",
              "HOUSEHOLD_INCOME",
              "OTHER_NUMERIC_QUESTION",
            ],
          },
        ],
        responses: {
          HOUSEHOLD_SIZE: 4,
          ADULTS_65_PLUS: true,
          CHILDREN_00_05: false,
          HOUSEHOLD_INCOME: 1000,
          IS_PREGNANT: true,
        },
        questions: {
          HOUSEHOLD_SIZE: {
            type: "NUMBER",
          },
          ADULTS_65_PLUS: {
            type: "BOOLEAN",
          },
          CHILDREN_00_05: {
            type: "BOOLEAN",
          },
          HOUSEHOLD_INCOME: {
            type: "CURRENCY",
          },
          IS_PREGNANT: {
            type: "BOOLEAN",
          },
          OTHER_NUMERIC_QUESTION: {
            type: "NUMBER",
          },
        },
      };
      const sectionKey = "SECTION_HOUSEHOLD";
      const questionKeys = [
        "HOUSEHOLD_SIZE",
        "ADULTS_65_PLUS",
        "CHILDREN_00_05",
        "HOUSEHOLD_INCOME",
        "OTHER_NUMERIC_QUESTION",
      ];

      renderWith(
        <ReviewSection sectionKey={sectionKey} questionKeys={questionKeys} />,
        {
          state: initialState,
        }
      );
    });

    it("renders headings", async () => {
      const [step1, householdSection] = screen.getAllByRole("heading");
      expect(step1).toHaveTextContent("review.step");
      expect(householdSection).toHaveTextContent("SECTION_HOUSEHOLD.title");
    });

    it("renders edit link", async () => {
      const editLink = screen.getByRole("link", {
        name: "review.actions.edit",
      });
      expect(editLink).toBeInTheDocument();
      expect(editLink).toHaveAttribute("href", "/app/survey");
    });

    it("renders responses", async () => {
      // All questions and answers should be displayed.
      const questionOne = screen.getByText(/ADULTS_65_PLUS.text/);
      expect(questionOne).toBeInTheDocument();
      const responseOne = screen.getByText("survey.question.boolean.yes");
      expect(responseOne).toBeInTheDocument();
      const questionTwo = screen.getByText(/HOUSEHOLD_SIZE.text/);
      expect(questionTwo).toBeInTheDocument();
      const responseTwo = screen.getByText(/4/);
      expect(responseTwo).toBeInTheDocument();
      const questionThree = screen.getByText(/HOUSEHOLD_INCOME.text/);
      expect(questionThree).toBeInTheDocument();
      const responseThree = screen.getByText(/\$1,000/);
      expect(responseThree).toBeInTheDocument();
      const questionFour = screen.getByText(/CHILDREN_00_05.text/);
      expect(questionFour).toBeInTheDocument();
      const responseFour = screen.getByText("survey.question.boolean.no");
      expect(responseFour).toBeInTheDocument();
    });

    it("supports tab navigation", () => {
      // Tab navigation cycles from body -> through edit link -> to body
      expect(document.body).toHaveFocus();
      userEvent.tab(); // onto edit link
      const editLink = screen.getByRole("link", {
        name: "review.actions.edit",
      });
      expect(editLink).toHaveFocus();
      userEvent.tab(); // onto body
      expect(document.body).toHaveFocus();
    });
  });
});

test("has no accessibility violations", async () => {
  const initialState = {
    survey: [{ SECTION_HOUSEHOLD: ["HOUSEHOLD_SIZE", "ADULTS_65_PLUS"] }],
    responses: {
      HOUSEHOLD_SIZE: 4,
      ADULTS_65_PLUS: true,
    },
    questions: {
      HOUSEHOLD_SIZE: {
        type: "NUMBER",
      },
      ADULTS_65_PLUS: {
        type: "BOOLEAN",
      },
    },
  };
  const sectionKey = "SECTION_HOUSEHOLD";
  const questionKeys = ["HOUSEHOLD_SIZE", "ADULTS_65_PLUS"];

  const { container } = renderWith(
    <ReviewSection sectionKey={sectionKey} questionKeys={questionKeys} />,
    {
      state: initialState,
    }
  );
  expect(await axe(container)).toHaveNoViolations();
});
