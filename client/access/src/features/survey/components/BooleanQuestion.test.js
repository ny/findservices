import "@testing-library/jest-dom/extend-expect";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import BooleanQuestion from "features/survey/components/BooleanQuestion";
import { axe, toHaveNoViolations } from "jest-axe";
import React from "react";
import { renderWith } from "maslow-shared/src/util/testing";

expect.extend(toHaveNoViolations);

describe("BooleanQuestion", () => {
  let mockUi = null;

  describe("without a response", () => {
    let eventTarget = null;
    let eventKey = null;

    beforeEach(() => {
      mockUi = renderWith(
        <BooleanQuestion
          questionKey="IS_EMPLOYED"
          value=""
          onChange={(evt) => {
            eventTarget = evt.target.value;
            eventKey = evt.target.name;
          }}
        />
      );
    });

    it("initially renders both 'Yes' and 'No' options", () => {
      expect(
        screen.getByRole("group", { name: "IS_EMPLOYED.text" })
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText("survey.question.boolean.yes")
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText("survey.question.boolean.no")
      ).toBeInTheDocument();
      expect(
        screen.queryByText("catalog:IS_EMPLOYED.hint")
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText("survey.question.boolean.error")
      ).not.toBeInTheDocument();
    });

    it("passes correct parameters to onChange function when a 'no' response is selected", () => {
      const noRadioButton = screen.getByLabelText("survey.question.boolean.no");
      expect(noRadioButton).not.toBeChecked();

      userEvent.click(noRadioButton);
      expect(eventTarget).toEqual("no");
      expect(eventKey).toEqual("IS_EMPLOYED");
    });

    it("passes correct parameters to onChange function when a 'yes' response is selected", () => {
      const yesRadioButton = screen.getByLabelText(
        "survey.question.boolean.yes"
      );
      expect(yesRadioButton).not.toBeChecked();

      userEvent.click(yesRadioButton);
      expect(eventTarget).toEqual("yes");
      expect(eventKey).toEqual("IS_EMPLOYED");
    });

    it("has no a11y violations", async () => {
      const { container } = mockUi;
      expect(await axe(container)).toHaveNoViolations();
    });

    it("supports tab navigation", () => {
      const yesRadioButton = screen.getByLabelText(
        "survey.question.boolean.yes"
      );
      const noRadioButton = screen.getByLabelText("survey.question.boolean.no");
      expect(yesRadioButton).not.toBeChecked();
      expect(noRadioButton).not.toBeChecked();

      // Tab navigation cycles from body -> yes -> body without checking
      expect(document.body).toHaveFocus();
      expect(yesRadioButton).not.toHaveFocus();
      expect(noRadioButton).not.toHaveFocus();
      userEvent.tab();
      expect(yesRadioButton).toHaveFocus();
      userEvent.tab();
      expect(document.body).toHaveFocus();
      expect(yesRadioButton).not.toBeChecked();
      expect(noRadioButton).not.toBeChecked();
    });
  });

  describe("with a yes response", () => {
    let yesRadioButton = null;
    let noRadioButton = null;

    beforeEach(() => {
      const questionKey = "IS_EMPLOYED";
      mockUi = renderWith(
        <BooleanQuestion
          questionKey={questionKey}
          value="yes"
          onChange={() => {}}
        />
      );
      yesRadioButton = screen.getByLabelText("survey.question.boolean.yes");
      noRadioButton = screen.getByLabelText("survey.question.boolean.no");
    });

    it("renders the response from props", () => {
      expect(yesRadioButton).toBeChecked();
      expect(noRadioButton).not.toBeChecked();
    });

    it("has no a11y violations", async () => {
      const { container } = mockUi;
      expect(await axe(container)).toHaveNoViolations();
    });

    it("supports tab navigation to selected yes button", () => {
      expect(yesRadioButton).not.toHaveFocus();
      expect(noRadioButton).not.toHaveFocus();

      // Tab navigation cycles from body -> yes(checked) -> body
      expect(document.body).toHaveFocus();
      userEvent.tab();
      expect(yesRadioButton).toHaveFocus();
      userEvent.tab();
      expect(document.body).toHaveFocus();

      expect(yesRadioButton).toBeChecked();
      expect(noRadioButton).not.toBeChecked();
    });
  });

  describe("with a no response", () => {
    let yesRadioButton = null;
    let noRadioButton = null;

    beforeEach(() => {
      const questionKey = "IS_EMPLOYED";
      mockUi = renderWith(
        <BooleanQuestion
          questionKey={questionKey}
          value="no"
          onChange={() => {}}
        />
      );
      yesRadioButton = screen.getByLabelText("survey.question.boolean.yes");
      noRadioButton = screen.getByLabelText("survey.question.boolean.no");
    });

    it("renders the response from props", () => {
      expect(yesRadioButton).not.toBeChecked();
      expect(noRadioButton).toBeChecked();
    });

    it("has no a11y violations", async () => {
      const { container } = mockUi;
      expect(await axe(container)).toHaveNoViolations();
    });

    it("supports tab navigation to selected no button", () => {
      // Tab navigation cycles from body -> no(checked) -> body
      expect(document.body).toHaveFocus();
      userEvent.tab();
      expect(noRadioButton).toHaveFocus();
      userEvent.tab();
      expect(document.body).toHaveFocus();

      expect(yesRadioButton).not.toBeChecked();
      expect(noRadioButton).toBeChecked();
    });
  });

  describe("when in an error state", () => {
    beforeEach(() => {
      mockUi = renderWith(
        <BooleanQuestion
          questionKey="IS_EMPLOYED"
          value=""
          onChange={() => {}}
          error={true}
        />
      );
    });

    it("displays error text", () => {
      expect(
        screen.getByLabelText("survey.question.boolean.yes")
      ).not.toBeChecked();
      const noRadioButton = screen.getByLabelText("survey.question.boolean.no");
      expect(noRadioButton).not.toBeChecked();
      const errorText = screen.getByText("survey.question.boolean.error");
      expect(errorText).toBeInTheDocument();
    });

    it("has no a11y violations", async () => {
      const { container } = mockUi;
      expect(await axe(container)).toHaveNoViolations();
    });
  });

  describe("when hint text is defined", () => {
    beforeEach(() => {
      mockUi = renderWith(
        <BooleanQuestion
          questionKey="ADULTS_65_PLUS"
          onChange={() => {}}
          value=""
        />
      );
    });

    it("displays hint text", () => {
      expect(screen.getByText("ADULTS_65_PLUS.hint")).toBeInTheDocument();
      expect(screen.getByText("ADULTS_65_PLUS.text")).toBeInTheDocument();
      expect(
        screen.getByLabelText("survey.question.boolean.yes")
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText("survey.question.boolean.no")
      ).toBeInTheDocument();
    });

    it("has no a11y violations", async () => {
      const { container } = mockUi;
      expect(await axe(container)).toHaveNoViolations();
    });
  });
});
