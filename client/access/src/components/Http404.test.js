import "@testing-library/jest-dom/extend-expect";
import { screen } from "@testing-library/react";
import Http404 from "components/Http404";
import { axe, toHaveNoViolations } from "jest-axe";
import React from "react";
import { renderWith } from "maslow-shared/src/util/testing";

expect.extend(toHaveNoViolations);

describe("The 404 page", () => {
  let container;

  beforeEach(() => {
    ({ container } = renderWith(<Http404 />));
  });

  it("displays an error message", () => {
    const header = screen.getByRole("heading");
    const content = screen.getByRole("region");

    expect(header).toHaveTextContent("http404.error.title");
    expect(content).toHaveTextContent("http404.error.text");
  });

  it("allows the user to start over", () => {
    const link = screen.getByRole("link", {
      name: "http404.actions.startOver",
    });
    expect(link).toHaveAttribute("href", "/app/survey");
  });

  it("allows the user to view all NYS services", () => {
    const link = screen.getByRole("link", {
      name: "http404.actions.seeAllServices",
    });
    expect(link).toHaveAttribute("href", "https://ny.gov/services");
  });

  it("has no axe violations", async () => {
    expect(await axe(container)).toHaveNoViolations();
  });
});
