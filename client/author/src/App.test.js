import { screen } from "@testing-library/react";
import App from "App";
import React from "react";
import { renderWith } from "maslow-shared/src/util/testing";
import axios from "axios";

jest.mock("axios");
// @ts-ignore
axios.get.mockResolvedValue({
  data: {
    services: {
      DOL_UA: {
        rank: 1,
        modified: "2020-01-01T10:00:00.000Z",
        enabled: true,
        resources: {
          en: {
            name: "Unemployment Assistance",
          },
        },
        resourceVersions: {
          en: "hash",
        },
      },
    },
  },
});

describe("App entrypoint", () => {
  beforeEach(async () => {
    const options = {
      routerOptions: {
        initialEntries: ["/app/services"],
      },
    };
    renderWith(<App />, options);
    screen.findAllByRole("heading");
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
});
