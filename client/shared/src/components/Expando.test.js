/* eslint-disable i18next/no-literal-string */
import "@testing-library/jest-dom/extend-expect";
import { screen } from "@testing-library/react";
import { Expando } from "components";
import React from "react";
import { renderWith } from "../util/testing";
import userEvent from "@testing-library/user-event";

const mockT = jest.fn().mockImplementation((lng, ns) => (key) => key);

jest.mock("react-i18next", () => {
  const realModule = jest.requireActual("react-i18next");

  // Mock return value just for getFixedT
  return {
    ...realModule,
    useTranslation: () => ({
      ...realModule.useTranslation(),
      i18n: {
        getFixedT: mockT,
      },
    }),
  };
});

describe("The Expando component", () => {
  afterEach(jest.clearAllMocks);

  describe("when content does not exceed the maximum height", () => {
    it("shows just the content", () => {
      const node = (
        <Expando maxHeight={1024}>
          <h1>Test</h1>
        </Expando>
      );
      renderWith(node);

      expect(screen.getByRole("heading")).toHaveTextContent("Test");
      expect(screen.queryByRole("button")).not.toBeInTheDocument();
      expect(screen.queryByTestId("gradient")).not.toBeInTheDocument();
    });
  });

  describe("when content exceeds the maximum height", () => {
    it("allows the user to toggle showing and hiding content", () => {
      const node = (
        <Expando maxHeight={0}>
          <h1>Test</h1>
        </Expando>
      );
      renderWith(node);

      const seeMore = screen.getByRole("button");
      expect(seeMore).toHaveTextContent("services.actions.seeMore");
      expect(screen.queryByTestId("gradient")).toBeInTheDocument();

      userEvent.click(seeMore);
      const seeLess = screen.getByRole("button");
      expect(seeLess).toBe(seeMore); // no new button, just changing the text
      expect(seeLess).toHaveTextContent("services.actions.seeLess");
      expect(screen.queryByTestId("gradient")).not.toBeInTheDocument();

      userEvent.click(seeLess);
      const seeMore_ = screen.getByRole("button");
      expect(seeMore_).toBe(seeMore);
      expect(seeMore_).toHaveTextContent("services.actions.seeMore");
      expect(screen.queryByTestId("gradient")).toBeInTheDocument();
    });

    it("can be expanded by default", () => {
      const node = (
        <Expando maxHeight={0} defaultExpanded={true}>
          <h1>Test</h1>
        </Expando>
      );
      renderWith(node);

      const seeLess = screen.getByRole("button");
      expect(seeLess).toHaveTextContent("services.actions.seeLess");
      expect(screen.queryByTestId("gradient")).not.toBeInTheDocument();
    });
  });

  describe("when a specific language is provided", () => {
    it("translates strings into that language", () => {
      renderWith(<Expando maxHeight={0} lng="es" />);
      expect(mockT).toHaveBeenCalledWith("es");
    });
  });
});
