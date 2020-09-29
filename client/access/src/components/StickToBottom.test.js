/* eslint-disable i18next/no-literal-string */
import "@testing-library/jest-dom/extend-expect";
import { screen } from "@testing-library/react";
import { StickToBottom } from "components/StickToBottom";
import { axe, toHaveNoViolations } from "jest-axe";
import { renderWith } from "maslow-shared/src/util/testing";
import React from "react";

expect.extend(toHaveNoViolations);

describe("StickToBottom", () => {
  let container;

  describe("when fixed to viewport", () => {
    beforeEach(() => {
      ({ container } = renderWith(
        <StickToBottom alwaysFixed={true}>
          <button>A button</button>
        </StickToBottom>
      ));
    });

    it("assigns fixed attributes to the container", () => {
      const content = screen.getByRole("status");
      const visibilityTracker = screen.queryByTestId("visibility-tracker");

      expect(content).toHaveClass("fixed");
      expect(visibilityTracker).not.toBeInTheDocument();
    });

    it("renders child content", () => {
      const content = screen.getByRole("status");
      const button = screen.getByRole("button");

      expect(content).toContainElement(button);
    });

    it("has no a11y errors", async () => {
      expect(await axe(container)).toHaveNoViolations();
    });
  });

  describe("when not fixed to viewport", () => {
    beforeEach(() => {
      ({ container } = renderWith(
        <StickToBottom alwaysFixed={false}>
          <button>A button</button>
        </StickToBottom>
      ));
    });

    it("does not assign fixed attributes to the container", () => {
      const content = screen.getByTestId("sticky-container");
      const visibilityTracker = screen.queryByTestId("visibility-tracker");

      expect(content).not.toHaveAttribute("role", "status");
      expect(content).not.toHaveClass("fixed");
      expect(visibilityTracker).toBeInTheDocument();
    });

    it("renders child content", () => {
      const content = screen.getByTestId("sticky-container");
      const button = screen.getByRole("button");

      expect(content).toContainElement(button);
    });

    it("has no a11y errors", async () => {
      expect(await axe(container)).toHaveNoViolations();
    });
  });
});
