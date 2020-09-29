import "@testing-library/jest-dom/extend-expect";
import { screen } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import React from "react";
import { renderWith } from "../util/testing";
import { AppHeader } from "./AppHeader.jsx";

expect.extend(toHaveNoViolations);

describe("app header", () => {
  let container = null;

  describe("with language selector (default)", () => {
    beforeEach(() => {
      ({ container } = renderWith(<AppHeader />));
    });

    it("renders", async () => {
      const banner = screen.getByRole("banner");
      expect(banner).toBeInTheDocument();
    });

    it("has logo", async () => {
      const logo = screen.getByRole("img", { name: "header.logo.label" });
      expect(logo).toBeInTheDocument();
    });

    it("has language selector", async () => {
      const listbox = screen.getByRole("listbox", {
        name: "header.languageSwitcher.label",
      });
      expect(listbox).toBeInTheDocument();
    });

    it("has no axe violations", async () => {
      const cut = await axe(container);
      expect(cut).toHaveNoViolations();
    });
  });

  describe("without language selector", () => {
    beforeEach(() => {
      ({ container } = renderWith(<AppHeader showLanguageSwitcher={false} />));
    });

    it("renders all other content", async () => {
      const banner = screen.getByRole("banner");
      expect(banner).toBeInTheDocument();
      const logo = screen.getByRole("img", { name: "header.logo.label" });
      expect(logo).toBeInTheDocument();
      expect(banner).toContainElement(logo);

      const listbox = screen.queryByRole("listbox");
      expect(listbox).not.toBeInTheDocument();

      const cut = await axe(container);
      expect(cut).toHaveNoViolations();
    });
  });
});
