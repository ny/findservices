import "@testing-library/jest-dom/extend-expect";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { i18nTestingInstance, renderWith } from "../util/testing";
import { axe, toHaveNoViolations } from "jest-axe";
import React from "react";

import { LanguageSwitcher } from "./LanguageSwitcher";

expect.extend(toHaveNoViolations);

describe("language switcher", () => {
  let container = null;

  beforeEach(() => {
    ({ container } = renderWith(<LanguageSwitcher />));
  });

  it("renders", async () => {
    const listbox = screen.getByRole("listbox", {
      name: "header.languageSwitcher.label",
    });
    expect(listbox).toBeInTheDocument();
  });

  it("switches language", async () => {
    // setup a spy so that we can validate that i18next.changeLanguage is called
    const changeLanguage = jest.spyOn(i18nTestingInstance, "changeLanguage");

    // open the language switcher
    const listbox = screen.getByRole("listbox", {
      name: "header.languageSwitcher.label",
    });
    userEvent.click(listbox);

    // find the currently selected language option
    const current = screen.getByRole("option", { selected: true });
    expect(current).toBeInTheDocument();
    const currentLanguage = current.textContent;

    // pick some other language option
    const desired = screen.getAllByRole("option", { selected: false })[0];
    expect(desired).toBeInTheDocument();
    const desiredLanguage = desired.textContent;

    // check that the display value of the dropdown is the current language
    const currentSetting = screen.getByRole("alert");
    expect(currentSetting).toHaveTextContent(currentLanguage);

    // click on the other language option
    expect(desiredLanguage).not.toEqual(currentLanguage);
    userEvent.click(desired);

    // check that the display value of the dropdown is the desired language
    const desiredSetting = screen.getByRole("alert");
    expect(desiredSetting).toHaveTextContent(desiredLanguage);

    // check that i18next.changeLanguage has been called
    expect(changeLanguage).toHaveBeenCalled();
  });

  it("has no axe violations", async () => {
    const cut = await axe(container);
    expect(cut).toHaveNoViolations();
  });
});
