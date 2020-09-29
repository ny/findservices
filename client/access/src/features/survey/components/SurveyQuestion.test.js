import "@testing-library/jest-dom/extend-expect";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import BooleanQuestion from "features/survey/components/BooleanQuestion";
import NumberQuestion from "features/survey/components/NumberQuestion";
import SurveyQuestion, {
  BooleanConverter,
  NumberConverter,
  QuestionFactory,
} from "features/survey/components/SurveyQuestion";
import survey from "features/survey/components/__fixtures__/survey";
import { responses } from "features/survey/components/__fixtures__/responses";
import React from "react";
import { mockStore, renderWith } from "maslow-shared/src/util/testing";

/**
 * The survey question displays a single question. Its primary responsibility
 * is to display the correct component for the question type and read/write the
 * components state into the redux store.
 */
describe("SurveyQuestion", () => {
  let options = null;

  describe("with BOOLEAN type", () => {
    const questionType = "BOOLEAN";

    beforeEach(() => {
      const state = Object.assign({}, survey, responses.positive);
      options = {
        state: state,
        store: mockStore(state),
      };

      renderWith(
        <SurveyQuestion questionKey="key" questionType={questionType} />,
        options
      );
    });

    it("renders question", async () => {
      const [radioY, radioN] = screen.getAllByRole("radio");
      expect(radioY).toBeInTheDocument();
      expect(radioN).toBeInTheDocument();
    });

    it("records a 'yes' response", async () => {
      const [radioY, radioN] = screen.getAllByRole("radio");
      expect(radioY).not.toBeChecked();
      expect(radioN).not.toBeChecked();

      userEvent.click(radioY);
      const expected = [
        { type: "responses/updateResponse", payload: { key: true } },
        { type: "report/clearReport" },
      ];
      const observed = options.store.getActions();
      expect(observed).toEqual(expected);
    });

    it("records a 'no' response", async () => {
      const [radioY, radioN] = screen.getAllByRole("radio");
      expect(radioY).not.toBeChecked();
      expect(radioN).not.toBeChecked();

      userEvent.click(radioN);
      const expected = [
        { type: "responses/updateResponse", payload: { key: false } },
        { type: "report/clearReport" },
      ];
      const observed = options.store.getActions();
      expect(observed).toEqual(expected);
    });
  });

  describe.each(["CURRENCY", "NUMBER"])("with %s type", (questionType) => {
    beforeEach(() => {
      const setup = Object.assign({}, responses.positive, { key: 1 });
      const state = Object.assign({}, survey, { responses: setup });
      options = {
        state: state,
        store: mockStore(state),
      };

      renderWith(
        <SurveyQuestion questionKey="key" questionType={questionType} />,
        options
      );
    });

    it("renders question", async () => {
      const spinbutton = screen.getByRole("spinbutton");
      expect(spinbutton).toBeInTheDocument();
    });

    it("records a valid, non-empty response", async () => {
      const spinbutton = screen.getByRole("spinbutton");

      userEvent.type(spinbutton, "1");
      const expected = [
        { type: "responses/updateResponse", payload: { key: 11 } },
        { type: "report/clearReport" },
      ];
      const observed = options.store.getActions();
      expect(observed).toEqual(expected);
    });

    it("deletes an empty response", async () => {
      const spinbutton = screen.getByRole("spinbutton");

      userEvent.type(spinbutton, "{backspace}");
      const expected = [
        { type: "responses/deleteResponse", payload: "key" },
        { type: "report/clearReport" },
      ];
      const observed = options.store.getActions();
      expect(observed).toEqual(expected);
    });
  });

  describe("with BooleanConverter", () => {
    it.each([
      ["yes", true],
      ["no", false],
      ["", undefined],
      [undefined, undefined],
      [null, undefined],
    ])("converts state to store (%p → %p)", (value, expected) => {
      const observed = BooleanConverter.stateToStore(value);
      expect(observed).toBe(expected);
    });

    it.each([
      [true, "yes"],
      [false, "no"],
      [undefined, ""],
      [null, ""],
    ])("converts store to state (%p → %p)", (value, expected) => {
      const observed = BooleanConverter.storeToState(value);
      expect(observed).toBe(expected);
    });
  });

  describe("with NumberConverter", () => {
    it.each([
      ["", undefined],
      ["0", 0],
      ["0234", 234],
      ["1234", 1234],
      ["12.4", 12],
      ["-234", 0],
      ["-2.4", 0],
      [undefined, undefined],
      [null, undefined],
    ])("converts state to store (%p → %p)", (value, expected) => {
      const observed = NumberConverter.stateToStore(value);
      expect(observed).toEqual(expected);
    });

    it.each([
      [0, "0"],
      [1234, "1234"],
      [undefined, ""],
      [null, ""],
    ])("converts store to state (%p → %p)", (value, expected) => {
      const observed = NumberConverter.storeToState(value);
      expect(observed).toEqual(expected);
    });
  });

  describe("with QuestionFactory", () => {
    it.each([
      ["BOOLEAN", BooleanQuestion, BooleanConverter],
      ["CURRENCY", NumberQuestion, NumberConverter],
      ["NUMBER", NumberQuestion, NumberConverter],
    ])("returns correct types for %s", (type, QuestionType, ConverterType) => {
      const { Question, Converter } = QuestionFactory.create(type);
      expect(Question).toBe(QuestionType);
      expect(Converter).toBe(ConverterType);
    });
  });
});
