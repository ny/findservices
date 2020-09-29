import "@testing-library/jest-dom/extend-expect";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Survey from "features/survey/components/Survey";
import { responses } from "features/survey/components/__fixtures__/responses";
import survey, {
  toSectionKeys,
} from "features/survey/components/__fixtures__/survey";
import { axe, toHaveNoViolations } from "jest-axe";
import _ from "lodash";
import { mockStore, renderWith } from "maslow-shared/src/util/testing";
import React from "react";
import routeData from "react-router";
import { sendFormEvent } from "util/analytics";

const mockHistoryPush = jest.fn();

expect.extend(toHaveNoViolations);

jest.mock("util/analytics");
jest.mock("maslow-shared", () => ({
  ...jest.requireActual("maslow-shared"),
  useScrollToTop: jest.fn(),
}));
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useHistory: () => ({
    push: mockHistoryPush,
  }),
}));

/**
 * Returns utility functions for accessing the navigation buttons and links that
 * appear on the survey page. They are returned as functions instead of values
 * so that they are re-evaluated each time they are called (for example, after
 * the page has updated in response to a user interaction.)
 */
const buttons = (screen) => {
  return {
    init: () => screen.queryByRole("button", { name: "survey.actions.init" }),
    back: () => screen.queryByRole("link", { name: "survey.actions.back" }),
    next: () => screen.queryByRole("button", { name: "survey.actions.next" }),
    done: () => screen.queryByRole("button", { name: "survey.actions.done" }),
  };
};

/**
 * The survey page is responsible for managing the navigation between steps of
 * the survey. It conditionally shows buttons/links based on the current state
 * of the page.
 */
describe("Survey navigation", () => {
  /**
   * The survey page requires survey data, fetched from the server API, in order
   * to function. If no data is found, it displays an error page.
   */

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("with no survey data", () => {
    beforeEach(() => {
      renderWith(<Survey />);
    });

    it("has no buttons", async () => {
      const { init, next, back, done } = buttons(screen);
      expect(init()).not.toBeInTheDocument();
      expect(next()).not.toBeInTheDocument();
      expect(back()).not.toBeInTheDocument();
      expect(done()).not.toBeInTheDocument();
    });

    it("shows error page", async () => {
      const heading = screen.getByRole("heading");
      expect(heading).toHaveTextContent("survey.error.title");
    });
  });

  /**
   * If all of the survey questions are configured to be asked in a single step,
   * it is considered a special case for navigation.
   */
  describe("with one section", () => {
    beforeEach(() => {
      const initialState = {
        survey: Array(1).fill({ section: [] }),
        responses: {},
      };
      renderWith(<Survey />, { state: initialState });
    });

    it("defaults to intro page", async () => {
      const heading = screen.getByRole("heading");
      expect(heading).toHaveTextContent("survey.intro.title");

      const { init, next, back, done } = buttons(screen);
      expect(init()).toBeInTheDocument();
      expect(next()).not.toBeInTheDocument();
      expect(back()).not.toBeInTheDocument();
      expect(done()).not.toBeInTheDocument();
    });

    it("goes to survey page on init", async () => {
      const { init, next, back, done } = buttons(screen);
      userEvent.click(init());

      const status = screen.getByRole("status");
      expect(status).toHaveTextContent("survey.actions.step");
      const heading = screen.getByRole("heading");
      expect(heading).toHaveTextContent("section.title");

      expect(init()).not.toBeInTheDocument();
      expect(next()).not.toBeInTheDocument();
      expect(back()).toBeInTheDocument();
      expect(done()).toBeInTheDocument();
    });

    describe("from only survey page", () => {
      beforeEach(() => {
        const { init } = buttons(screen);
        userEvent.click(init());
      });

      it("goes to intro page on back", async () => {
        const { back } = buttons(screen);
        const heading = () => screen.getByRole("heading");

        expect(heading()).toHaveTextContent("section.title");
        userEvent.click(back());
        expect(heading()).toHaveTextContent("survey.intro.title");
      });

      it("goes to review page on done", async () => {
        const { done } = buttons(screen);
        userEvent.click(done());
        expect(mockHistoryPush).toHaveBeenCalledWith("/app/review");
      });
    });
  });

  /**
   * This is the common case, with survey questions staged over multiple steps.
   */
  describe("with multiple sections", () => {
    beforeEach(() => {
      const initialState = {
        survey: Array(3).fill({ section: [] }),
        responses: {},
      };
      renderWith(<Survey />, { state: initialState });
    });

    it("defaults to intro page", async () => {
      const heading = screen.getByRole("heading");
      expect(heading).toHaveTextContent("survey.intro.title");

      const { init, next, back, done } = buttons(screen);
      expect(init()).toBeInTheDocument();
      expect(next()).not.toBeInTheDocument();
      expect(back()).not.toBeInTheDocument();
      expect(done()).not.toBeInTheDocument();
    });

    it("goes to survey page on init", async () => {
      const { init, next, back, done } = buttons(screen);
      userEvent.click(init());

      const status = screen.getByRole("status");
      expect(status).toHaveTextContent("survey.actions.step");
      const heading = screen.getByRole("heading");
      expect(heading).toHaveTextContent("section.title");

      expect(init()).not.toBeInTheDocument();
      expect(next()).toBeInTheDocument();
      expect(back()).toBeInTheDocument();
      expect(done()).not.toBeInTheDocument();
    });

    describe("from first survey page", () => {
      beforeEach(() => {
        const { init } = buttons(screen);
        userEvent.click(init());
      });

      it("goes to intro page on back", async () => {
        const { back } = buttons(screen);
        const heading = () => screen.getByRole("heading");

        expect(heading()).toHaveTextContent("section.title");
        userEvent.click(back());
        expect(heading()).toHaveTextContent("survey.intro.title");
      });

      it("goes to inner survey page on next", async () => {
        const { next } = buttons(screen);
        userEvent.click(next());

        const heading = screen.getByRole("heading");
        expect(heading).toHaveTextContent("section.title");
      });
    });

    describe("from inner survey page", () => {
      beforeEach(() => {
        const { init, next } = buttons(screen);
        userEvent.click(init());
        userEvent.click(next());
      });

      it("goes to previous survey page on back", async () => {
        const { back } = buttons(screen);
        const heading = () => screen.getByRole("heading");

        expect(heading()).toHaveTextContent("section.title");
        userEvent.click(back());
        expect(heading()).toHaveTextContent("section.title");
      });

      it("goes to next survey page on next", async () => {
        const { next } = buttons(screen);
        userEvent.click(next());

        const heading = screen.getByRole("heading");
        expect(heading).toHaveTextContent("section.title");
      });
    });

    describe("from final survey page", () => {
      beforeEach(() => {
        const { init, next } = buttons(screen);
        userEvent.click(init());
        userEvent.click(next());
        userEvent.click(next());
      });

      it("goes to inner survey page on back", async () => {
        const { back } = buttons(screen);
        const heading = () => screen.getByRole("heading");

        expect(heading()).toHaveTextContent("section.title");
        userEvent.click(back());
        expect(heading()).toHaveTextContent("section.title");
      });

      it("goes to review page on done", async () => {
        const { done } = buttons(screen);
        userEvent.click(done());
        expect(mockHistoryPush).toHaveBeenCalledWith("/app/review");
      });
    });
  });
});

/**
 * Responses are required for all survey questions. We validate that responses
 * have been provided when the user tries to progress to the next step. If
 * responses are missing, we don't let the user go forward (they can go
 * back, though).
 */
describe("Survey validation", () => {
  describe("with missing responses", () => {
    let options = null;

    beforeEach(() => {
      const state = Object.assign({}, survey, responses.empty);
      options = {
        state: state,
        store: mockStore(state),
      };

      renderWith(<Survey />, options);
    });

    it("denies next", async () => {
      const sectionKeys = toSectionKeys(options.state.survey);
      const { init, next } = buttons(screen);
      userEvent.click(init());

      const heading = () => screen.getByRole("heading");
      expect(heading()).toHaveTextContent(`${sectionKeys[0]}.title`);
      userEvent.click(next());
      expect(heading()).toHaveTextContent(`${sectionKeys[0]}.title`);
      expect(sendFormEvent).not.toHaveBeenCalled();
    });

    it("shows error state on next", async () => {
      const { init, next } = buttons(screen);
      userEvent.click(init());

      const alerts = () => screen.queryAllByRole("alert");
      expect(alerts()).toHaveLength(0);

      userEvent.click(next());
      // The minimum 2 errors are: (1) the error beneath the `next` button, and
      // (2) the error for one of the unanswered questions.
      expect(alerts().length).toBeGreaterThanOrEqual(2);
    });

    it("allows back", async () => {
      const sectionKeys = toSectionKeys(options.state.survey);
      const { init, back, next } = buttons(screen);
      userEvent.click(init());

      const heading = () => screen.getByRole("heading");
      expect(heading()).toHaveTextContent(`${sectionKeys[0]}.title`);
      userEvent.click(next());
      expect(heading()).toHaveTextContent(`${sectionKeys[0]}.title`);
      userEvent.click(back());
      expect(heading()).toHaveTextContent("survey.intro.title");
      expect(sendFormEvent).not.toHaveBeenCalled();
    });
  });

  describe("with valid responses", () => {
    let options = null;

    beforeEach(() => {
      jest.clearAllMocks();
      const state = Object.assign({}, survey, responses.positive);
      options = {
        state: state,
        store: mockStore(state),
      };

      renderWith(<Survey />, options);
    });

    it("allows next", async () => {
      const sectionKeys = toSectionKeys(options.state.survey);
      const { init, next } = buttons(screen);
      userEvent.click(init());

      // Next button successfully changes sections.
      const heading = screen.getByRole("heading");
      expect(heading).toHaveTextContent(`${sectionKeys[0]}.title`);
      userEvent.click(next());
      expect(heading).toHaveTextContent(`${sectionKeys[1]}.title`);

      // Section change sends Google Analytics event with one response.
      expect(sendFormEvent).toHaveBeenCalledWith({ IS_EMPLOYED: "true" });
      expect(sendFormEvent).toHaveBeenCalledTimes(1);

      // @ts-ignore due to jest.mock
      sendFormEvent.mockClear();

      // Section change sends Google Analytics event with multiple responses.
      userEvent.click(next());
      expect(heading).toHaveTextContent(`${sectionKeys[2]}.title`);
      expect(sendFormEvent).toHaveBeenCalledWith({
        ADULTS_65_PLUS: "true",
        CHILDREN_00_05: "true",
        CHILDREN_06_12: "true",
        CHILDREN_13_17: "true",
        HOUSEHOLD_INCOME: "1",
        HOUSEHOLD_SIZE: "1",
      });
      expect(sendFormEvent).toHaveBeenCalledTimes(1);
    });

    it("hides error state", async () => {
      const { init, next } = buttons(screen);
      userEvent.click(init());
      userEvent.click(next());

      const alerts = screen.queryAllByRole("alert");
      expect(alerts).toHaveLength(0);
    });
  });
});

/**
 * On the review page, users are given the chance to go back to a particular
 * step and edit their responses. This requires special handling for
 * deep-linking into the survey page, since the survey page intentionally does
 * not expose the current step in the URL. We do this so that if the user
 * refreshes the page and obliterates their responses, they will start again at
 * the beginning of the survey.
 */
describe("Survey deep-linking", () => {
  const state = Object.assign({}, survey, responses.positive);
  const steps = _.range(1, state.survey.length + 1);
  let options = null;

  beforeEach(() => {
    options = {
      state: state,
      store: mockStore(state),
    };
  });

  describe.each(steps)("routing to step %d", (step) => {
    beforeEach(() => {
      const mockLocation = {
        state: {
          step: step,
        },
      };

      const spy = jest
        .spyOn(routeData, "useLocation")
        // @ts-ignore: The Location type from React Router supports user-defined
        // state, but the type-checking system in vscode doesn't recognize it.
        .mockReturnValue(mockLocation);

      renderWith(<Survey />, options);

      spy.mockRestore();
    });

    it("starts on correct page", async () => {
      const sectionKeys = toSectionKeys(options.state.survey);
      const heading = screen.getByRole("heading");
      expect(heading).toHaveTextContent(`${sectionKeys[step - 1]}.title`);
    });
  });
});

test("survey is accessible", async () => {
  const initialState = {
    survey: [
      {
        HOUSEHOLD_SECTION: ["HOUSEHOLD_SIZE", "ADULTS_65_PLUS"],
      },
    ],
    responses: {},
    questions: {
      HOUSEHOLD_SIZE: {
        type: "NUMBER",
      },
      ADULTS_65_PLUS: {
        type: "BOOLEAN",
      },
    },
  };
  const { container } = renderWith(<Survey />, { state: initialState });
  const { init } = buttons(screen);
  userEvent.click(init());
  expect(await axe(container)).toHaveNoViolations();
});
