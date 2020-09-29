import { screen } from "@testing-library/react";
import SelectedServices from "features/services/components/SelectedServices";
import { axe, toHaveNoViolations } from "jest-axe";
import React from "react";
import { renderWith } from "maslow-shared/src/util/testing";

expect.extend(toHaveNoViolations);

describe("The selected services bar", () => {
  let container = null;

  describe("with services selected", () => {
    beforeEach(() => {
      ({ container } = renderWith(
        <SelectedServices serviceKeys={["DOL_UA", "DOL_PUA"]} />
      ));
    });

    it("enables the button to view report", async () => {
      const button = screen.getByRole("button");
      expect(button).toHaveTextContent("services.actions.viewSaved");
      expect(button).toBeEnabled();
    });

    it("has no a11y violations", async () => {
      expect(await axe(container)).toHaveNoViolations();
    });
  });

  describe("with no services selected", () => {
    beforeEach(() => {
      ({ container } = renderWith(<SelectedServices serviceKeys={[]} />));
    });

    it("hides the button to view report", async () => {
      const button = screen.queryByRole("button");
      expect(button).not.toBeInTheDocument();
    });

    it("has no a11y violations", async () => {
      expect(await axe(container)).toHaveNoViolations();
    });
  });
});
