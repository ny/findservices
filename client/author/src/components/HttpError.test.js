import "@testing-library/jest-dom/extend-expect";
import { screen } from "@testing-library/react";
import HttpError from "components/HttpError";
import { axe, toHaveNoViolations } from "jest-axe";
import React from "react";
import { renderWith } from "maslow-shared/src/util/testing";

expect.extend(toHaveNoViolations);

describe.skip("The 404 page", () => {
  let container;

  beforeEach(() => {
    ({ container } = renderWith(<HttpError errorMessage="error" />));
  });

  it("displays an error message", () => {
    const header = screen.getByRole("heading");
    const content = screen.getByRole("region");

    expect(header).toHaveTextContent("httpError.title");
    expect(content).toHaveTextContent("error");
  });

  it("allows the user to start over", () => {
    const link = screen.getByRole("link", {
      name: "httpError.actions.startOver",
    });
    expect(link).toHaveAttribute("href", "/app/services");
  });

  it("has no axe violations", async () => {
    expect(await axe(container)).toHaveNoViolations();
  });
});
