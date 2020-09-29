import "@testing-library/jest-dom/extend-expect";
import { screen } from "@testing-library/react";
import { AppFooter } from "./AppFooter";
import { axe, toHaveNoViolations } from "jest-axe";
import React from "react";
import { renderWith } from "../util/testing";

expect.extend(toHaveNoViolations);

/* Helper function to verify that a given link goes to a corresponding URL. */
const verifyLink = (name, target) => {
  const link = screen.getByRole("link", { name: name });
  expect(link).toHaveAttribute("href", target);
};

describe("The app-wide footer", () => {
  let container;

  beforeEach(() => {
    ({ container } = renderWith(<AppFooter />));
  });

  it("is accessible to a screen reader", async () => {
    expect(await axe(container)).toHaveNoViolations();
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });

  // eslint-disable-next-line jest/expect-expect
  it("contains links to ny.gov resources", () => {
    verifyLink("footer.title.label", "https://ny.gov/services");
    verifyLink("footer.accessibility.text", "https://www.ny.gov/node/55121");
    verifyLink("footer.disclaimer.text", "https://www.ny.gov/node/55126");
    verifyLink("footer.privacyPolicy.text", "https://www.ny.gov/node/56891");
  });

  // eslint-disable-next-line jest/expect-expect
  it("contains links to ny.gov social media accounts", () => {
    verifyLink("footer.instagram.label", "https://www.instagram.com/nygov/");
    verifyLink("footer.twitter.label", "https://twitter.com/nygov");
  });
});
