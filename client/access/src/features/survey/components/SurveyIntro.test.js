import "@testing-library/jest-dom/extend-expect";
import { screen } from "@testing-library/react";
import SurveyIntro from "features/survey/components/SurveyIntro";
import { axe, toHaveNoViolations } from "jest-axe";
import React from "react";
import { renderWith } from "maslow-shared/src/util/testing";

expect.extend(toHaveNoViolations);

describe("SurveyIntro", () => {
  beforeEach(() => {
    renderWith(<SurveyIntro />);
  });

  it("has heading", async () => {
    const heading = screen.getByRole("heading");
    expect(heading).toHaveTextContent("survey.intro.title");
  });

  it("has body", async () => {
    const body = screen.getByText("survey.intro.body");
    expect(body).toBeInTheDocument();
  });

  it("has How it Works section", async () => {
    const title = screen.getByText("survey.intro.howItWorks.title");
    expect(title).toBeInTheDocument();
    const [stepOne, stepTwo, stepThree] = screen.getAllByRole("listitem");
    expect(stepOne).toHaveTextContent("survey.intro.howItWorks.stepOne");
    expect(stepTwo).toHaveTextContent("survey.intro.howItWorks.stepTwo");
    expect(stepThree).toHaveTextContent("survey.intro.howItWorks.stepThree");
  });
});

test("survey intro is accessible", async () => {
  const { container } = renderWith(<SurveyIntro />);
  const cut = await axe(container);
  expect(cut).toHaveNoViolations();
});
