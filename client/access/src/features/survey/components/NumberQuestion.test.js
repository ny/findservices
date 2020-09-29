import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import NumberQuestion from "features/survey/components/NumberQuestion";
import { axe, toHaveNoViolations } from "jest-axe";
import React from "react";
import { renderWith } from "maslow-shared/src/util/testing";

expect.extend(toHaveNoViolations);

describe("NumberQuestion", () => {
  describe("with input hint", () => {
    it("renders with explicit default answer type", async () => {
      const { queryByText } = renderWith(
        <NumberQuestion
          questionKey="HOUSEHOLD_SIZE"
          value=""
          onChange={jest.fn()}
        />
      );

      expect(queryByText("$")).not.toBeInTheDocument();
    });

    it("renders with currency answer type", async () => {
      const { container } = renderWith(
        <NumberQuestion
          questionKey="HOUSEHOLD_INCOME"
          questionType="CURRENCY"
          value=""
          onChange={jest.fn()}
        />
      );

      expect(container.querySelector(".icon.currency")).toBeInTheDocument();
    });

    it("renders with currency and is tab accessible", async () => {
      renderWith(
        <NumberQuestion
          questionKey="HOUSEHOLD_INCOME"
          questionType="CURRENCY"
          value=""
          onChange={jest.fn()}
        />
      );

      expect(document.body).toHaveFocus();
      userEvent.tab();
      expect(screen.getByLabelText("HOUSEHOLD_INCOME.text")).toHaveFocus();
    });
  });

  describe("without a response", () => {
    it("renders empty number input", async () => {
      const { getByText, getByLabelText } = renderWith(
        <NumberQuestion
          questionKey="HOUSEHOLD_SIZE"
          value=""
          onChange={jest.fn()}
        />
      );
      expect(getByText("HOUSEHOLD_SIZE.text")).toBeInTheDocument();
      expect(getByText("HOUSEHOLD_SIZE.hint")).toBeInTheDocument();
      expect(getByLabelText("HOUSEHOLD_SIZE.text")).toHaveValue(null);
    });

    it("renders error", async () => {
      renderWith(
        <NumberQuestion
          questionKey="HOUSEHOLD_SIZE"
          value=""
          onChange={jest.fn()}
          error={true}
        />
      );
      const errorText = screen.getByText("survey.question.number.error");
      expect(errorText).toBeInTheDocument();
    });

    it("has no a11y violations", async () => {
      const { container } = renderWith(
        <NumberQuestion
          questionKey="HOUSEHOLD_SIZE"
          value=""
          onChange={jest.fn()}
        />
      );
      expect(await axe(container)).toHaveNoViolations();
    });

    it("has no a11y violations in error state", async () => {
      // Update number input to an invalid non-integer input.
      const { container } = renderWith(
        <NumberQuestion
          questionKey="HOUSEHOLD_SIZE"
          value="not a number"
          onChange={jest.fn()}
          error={true}
        />
      );

      expect(await axe(container)).toHaveNoViolations();
    });
  });

  describe("with a response", () => {
    it("renders number response", async () => {
      const { getByLabelText } = renderWith(
        <NumberQuestion
          questionKey="HOUSEHOLD_SIZE"
          value="7"
          onChange={jest.fn()}
        />
      );
      expect(getByLabelText("HOUSEHOLD_SIZE.text")).toHaveValue(7);
    });

    it("has no a11y violations", async () => {
      const { container } = renderWith(
        <NumberQuestion
          questionKey="HOUSEHOLD_SIZE"
          value="7"
          onChange={jest.fn()}
        />
      );
      expect(await axe(container)).toHaveNoViolations();
    });
  });
});
