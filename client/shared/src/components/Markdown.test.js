/* eslint-disable i18next/no-literal-string */
import "@testing-library/jest-dom/extend-expect";
import { screen } from "@testing-library/react";
import React from "react";
import { renderWith } from "../util/testing";
import { Markdown } from "./Markdown";

describe("The Markdown component", () => {
  it("renders external links with an icon", () => {
    renderWith(<Markdown source="[test link](https://google.com/)" />);
    expect(screen.getByRole("link")).toHaveClass("external");
  });

  it("renders external links in a new tab", () => {
    renderWith(<Markdown source="[test link](https://google.com/)" />);
    expect(screen.getByRole("link")).toHaveAttribute("target", "_blank");
  });

  it("renders internal links without an icon", () => {
    renderWith(<Markdown source="[test link](https://localhost:3000/)" />);
    expect(screen.getByRole("link")).not.toHaveClass("external");
  });
});
