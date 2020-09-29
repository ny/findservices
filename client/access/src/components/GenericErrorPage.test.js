import "@testing-library/jest-dom/extend-expect";
import { screen } from "@testing-library/react";
import GenericErrorPage from "components/GenericErrorPage";
import { axe, toHaveNoViolations } from "jest-axe";
import React from "react";
import { renderWith } from "maslow-shared/src/util/testing";

expect.extend(toHaveNoViolations);

describe("GenericErrorPage", () => {
  beforeEach(() => {
    renderWith(<GenericErrorPage />);
  });

  it("has heading", async () => {
    const heading = screen.getByRole("heading", { name: "survey.error.title" });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent("survey.error.title");
  });

  it("has body", async () => {
    const body = screen.getByRole("region");
    expect(body).toBeInTheDocument();
    expect(body).toHaveTextContent("survey.error.text");
  });

  it("has button to navigate to all services", async () => {
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent("survey.actions.seeAllServices");
  });
});

test("survey empty is accessible", async () => {
  const { container } = renderWith(<GenericErrorPage />);
  expect(await axe(container)).toHaveNoViolations();
});
