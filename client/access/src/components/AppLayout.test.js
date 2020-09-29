/* eslint-disable i18next/no-literal-string */
/* eslint-disable react/display-name */
/* eslint-disable react/prop-types */
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";
import AppLayout from "components/AppLayout";
import { renderWith } from "maslow-shared/src/util/testing";
import React from "react";

jest.mock("axios");
// Force Catalog to render its children (avoiding empty loading state).
jest.mock("components/Catalog", () => {
  return {
    __esModule: true,
    default: ({ children }) => {
      return <>{children}</>;
    },
  };
});

describe("The standard application layout", () => {
  beforeEach(() => {
    // @ts-ignore
    axios.get.mockResolvedValue({
      data: {
        rank: [],
        services: {},
      },
    });

    const options = {
      state: {
        responses: {},
        survey: [{ FAKE_SECTION: [] }],
      },
    };
    renderWith(
      <AppLayout>
        <h1>My Heading</h1>
      </AppLayout>,
      options
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("has the app-wide header", () => {
    expect(screen.getByRole("banner")).toBeInTheDocument();
  });

  it("has landmark accessibility region for main", () => {
    expect(screen.getByRole("main")).toBeInTheDocument();
  });

  it("has the app-wide footer", () => {
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });

  it("has skip to main content for screen reader accessibility", () => {
    const [skipToContentLink] = screen.getAllByRole("button");
    expect(skipToContentLink).toHaveTextContent("header.skipToContent");

    const main = screen.getByRole("main");
    // Mocked globally in setupTests.js
    const scrollIntoView = global.HTMLElement.prototype.scrollIntoView;

    expect(main).not.toHaveFocus();
    expect(scrollIntoView).not.toHaveBeenCalled();
    userEvent.click(skipToContentLink);
    expect(main).toHaveFocus();
    expect(scrollIntoView).toHaveBeenCalledTimes(1);
  });

  it("renders its children", () => {
    const heading = screen.getByRole("heading");
    expect(heading).toHaveTextContent("My Heading");
  });
});
