/* eslint-disable i18next/no-literal-string */
import "@testing-library/jest-dom/extend-expect";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import { renderWith } from "maslow-shared/src/util/testing";
import React from "react";
import SingletonAccordion from "./SingletonAccordion";

expect.extend(toHaveNoViolations);

describe("SingletonAccordion", () => {
  let container;

  beforeEach(() => {
    ({ container } = renderWith(
      <SingletonAccordion id="test" title="Test">
        <button>A button</button>
      </SingletonAccordion>
    ));
  });

  it("toggles between open/closed states when clicking the title", () => {
    const accordionTitle = screen.getByTestId("accordion-title");
    expect(accordionTitle).toHaveAttribute("aria-expanded", "false");
    userEvent.click(accordionTitle);
    expect(accordionTitle).toHaveAttribute("aria-expanded", "true");
  });

  it("has no a11y violations", async () => {
    expect(await axe(container)).toHaveNoViolations();
  });
});
