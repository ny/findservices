/* eslint-disable react/prop-types */
/* eslint-disable react/display-name */
import "@testing-library/jest-dom/extend-expect";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Review from "features/review/components/Review";
import { axe, toHaveNoViolations } from "jest-axe";
import { mockStore, renderWith } from "maslow-shared/src/util/testing";
import React from "react";
import { sendPageViewEvent } from "util/analytics";

jest.mock("util/analytics");
// Force Catalog to render its children (avoiding empty loading state).
jest.mock("components/Catalog", () => {
  return {
    __esModule: true,
    default: ({ children }) => {
      return <>{children}</>;
    },
  };
});
global.scrollTo = jest.fn();
expect.extend(toHaveNoViolations);

const catalog = {
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
  responses: {
    IS_EMPLOYED: false,
    HOUSEHOLD_SIZE: "2",
    HOUSEHOLD_INCOME: "200",
    ADULTS_65_PLUS: false,
    CHILDREN_13_17: true,
    CHILDREN_06_12: false,
    CHILDREN_00_05: false,
    IS_PREGNANT: false,
    IS_STUDENT: true,
    IS_DISABLED: false,
    IS_MILITARY: false,
  },
};

describe("review page", () => {
  let options = null;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("with responses", () => {
    beforeEach(() => {
      const state = Object.assign({}, catalog);
      options = {
        state: state,
        store: mockStore(state),
      };

      renderWith(<Review />, options);
    });

    it("logs page view event", async () => {
      expect(sendPageViewEvent).toHaveBeenCalledWith(
        "/questions-review",
        "Questions Review"
      );
      expect(sendPageViewEvent).toHaveBeenCalledTimes(1);
    });

    it("has heading", async () => {
      const heading = screen.getByRole("heading", { name: "review.title" });
      expect(heading).toBeInTheDocument();
    });

    it("has link to start over the survey", async () => {
      const link = screen.getByRole("link", {
        name: "review.actions.restart",
      });
      expect(link).toBeVisible();
      expect(link).toHaveAttribute("href", "/app/survey");
    });

    it("shows button to see your services", async () => {
      const button = screen.getByRole("button", {
        name: "review.actions.next",
      });
      expect(button).toBeVisible();
      expect(button).toBeEnabled();
    });

    it("initializes focus on the document body", async () => {
      expect(document.body).toHaveFocus();
    });

    it("displays all sections", async () => {
      const [
        title,
        step1,
        yourself,
        step2,
        household,
        step3,
        situation,
      ] = screen.getAllByRole("heading");
      expect(title).toHaveTextContent("review.title");
      expect(step1).toHaveTextContent("review.step");
      expect(yourself).toHaveTextContent("SECTION_YOURSELF.title");
      expect(step2).toHaveTextContent("review.step");
      expect(household).toHaveTextContent("SECTION_HOUSEHOLD.title");
      expect(step3).toHaveTextContent("review.step");
      expect(situation).toHaveTextContent("SECTION_SITUATION.title");
    });

    describe("using mouse", () => {
      it("clears prior responses before starting over", async () => {
        const link = screen.getByRole("link", {
          name: "review.actions.restart",
        });
        userEvent.click(link);

        const observed = options.store.getActions();
        const expected = [
          { type: "responses/clearResponses" },
          { type: "report/clearReport" },
        ];
        expect(observed).toEqual(expected);
      });
    });

    describe("using keyboard", () => {
      it("clears prior responses before starting over", async () => {
        const link = screen.getByRole("link", {
          name: "review.actions.restart",
        });
        userEvent.type(link, "{enter}");

        const observed = options.store.getActions();
        const expected = [
          { type: "responses/clearResponses" },
          { type: "report/clearReport" },
        ];
        expect(observed).toEqual(expected);
      });

      it("allows editing of prior responses", async () => {
        expect(document.body).toHaveFocus();

        userEvent.tab(); // Skip to main content.
        userEvent.tab(); // NYS logo.
        userEvent.tab(); // Language menu.
        userEvent.tab(); // First edit link.

        const edit = screen.getAllByRole("link", {
          name: "review.actions.edit",
        });
        expect(edit.shift()).toHaveFocus();
      });
    });
  });
});

test("has no accessibility violations", async () => {
  const options = {
    state: Object.assign({}, catalog),
  };
  const { container } = renderWith(<Review />, options);
  expect(await axe(container)).toHaveNoViolations();
});
