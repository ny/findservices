import "@testing-library/jest-dom/extend-expect";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SurveySection from "features/survey/components/SurveySection";
import { responses } from "features/survey/components/__fixtures__/responses";
import survey from "features/survey/components/__fixtures__/survey";
import { axe, toHaveNoViolations } from "jest-axe";
import _ from "lodash";
import { mockStore, renderWith } from "maslow-shared/src/util/testing";
import React from "react";
import { sendPageViewEvent } from "util/analytics";

jest.mock("util/analytics");
jest.mock("maslow-shared", () => ({
  ...jest.requireActual("maslow-shared"),
  useScrollToTop: jest.fn(),
}));

expect.extend(toHaveNoViolations);

/**
 * The survey is comprised of sections, and each section displays one or more
 * questions. The primary responsibility of the survey section is to display the
 * correct data for the current step and validate whether the user has provided
 * responses to all required questions in order to move on.
 */
describe("SurveySection", () => {
  const state = Object.assign({}, survey, responses.positive);
  const steps = _.range(1, state.survey.length + 1);
  let options = null;

  beforeEach(() => {
    options = {
      state: state,
      store: mockStore(state),
    };
  });

  describe.each(steps)("on step %d", (step) => {
    let container = null;

    beforeEach(() => {
      jest.clearAllMocks();

      ({ container } = renderWith(
        <SurveySection
          step={step}
          survey={options.state.survey}
          error={true}
        />,
        options
      ));
    });

    it("shows progress indicator", async () => {
      const progress = screen.getByRole("status");
      expect(progress).toHaveTextContent("survey.actions.step");
    });

    it("shows appropriate heading for step", async () => {
      const section = options.state.survey[step - 1];
      const [sectionKey] = _(section).entries().first();

      const heading = screen.getByRole("heading");
      expect(heading).toHaveTextContent(`${sectionKey}.title`);
      expect(heading).toHaveFocus();
    });

    it("shows appropriate questions for step", async () => {
      // Query the survey test fixture data to figure out how many questions
      // there are of each type on this particular step.
      const section = options.state.survey[step - 1];
      const questions = options.state.questions;
      const [, questionKeys] = _(section).entries().first();
      const questionKeysByType = _(questionKeys)
        .groupBy((k) => questions[k].type)
        .defaults({
          BOOLEAN: [],
          CURRENCY: [],
          NUMBER: [],
        })
        .value();

      // There should be two radio buttons for each BOOLEAN question (yes/no).
      const radios = screen.queryAllByRole("radio");
      const radiosLength = questionKeysByType.BOOLEAN.length * 2;
      expect(radios).toHaveLength(radiosLength);

      // There should be one number input for each CURRENCY/NUMBER question.
      const inputs = screen.queryAllByRole("spinbutton");
      const inputsLength =
        questionKeysByType.CURRENCY.length + questionKeysByType.NUMBER.length;
      expect(inputs).toHaveLength(inputsLength);
    });

    it("logs page view to Google Analytics", async () => {
      expect(sendPageViewEvent).toHaveBeenCalledWith(
        `/questions-${step}`,
        `Questions ${step}`
      );
      expect(sendPageViewEvent).toHaveBeenCalledTimes(1);
    });

    it("supports keyboard entry", async () => {
      // Ensure that input focus is in the same order as questions.
      const section = options.state.survey[step - 1];
      const [, questionKeys] = _(section).entries().first();

      // For this test, we cannot use getByRole or similar because there isn't
      // an accessible role that combines both "radio" and "spinbutton", so we
      // resort to selecting by HTML element. We also filter out the second
      // radio button of each radio group (with the label "no") since tabbing
      // through the form switches between group, not radio.
      const inputs = _.chain(container.querySelectorAll("input"))
        .filter((input) => input.value !== "no")
        .value();
      expect(inputs).toHaveLength(questionKeys.length);

      for (const [input, questionKey] of _.zip(inputs, questionKeys)) {
        expect(input.name).toEqual(questionKey);

        // This is a bit of theater only -- the mock redux store does not
        // actually save our inputs into state, so we cannot validate that our
        // response was saved. We properly test that functionality in
        // SurveyQuestion instead.
        const data = input.type === "radio" ? "{space}" : "1";
        userEvent.type(input, data);

        // Go to the next input and question.
        userEvent.tab();
      }
    });

    it("has no axe accessibility violations", async () => {
      expect(await axe(container)).toHaveNoViolations();
    });
  });
});
