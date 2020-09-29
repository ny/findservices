/* eslint-disable react/display-name */
/* eslint-disable react/prop-types */
import "@testing-library/jest-dom/extend-expect";
import { screen } from "@testing-library/react";
import axios from "axios";
import { renderWith } from "maslow-shared/src/util/testing";
import React from "react";
import Routes from "Routes";

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: () => 0,
}));
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
global.scrollTo = jest.fn();

beforeEach(() => {
  // @ts-ignore
  axios.get.mockResolvedValue({
    data: {
      rank: [],
      services: {},
    },
  });
});

afterEach(() => {
  jest.clearAllMocks();
});

describe("router", () => {
  it("routes / to Survey", async () => {
    const options = {
      state: {
        responses: {},
        survey: [],
      },
    };
    renderWith(<Routes />, options);

    const headings = screen.getAllByRole("heading");
    expect(headings[0]).toHaveTextContent("survey.error.title");
  });

  it("routes /app/survey to Survey", async () => {
    const options = {
      routerOptions: {
        initialEntries: ["/app/survey"],
      },
      state: {
        responses: {},
        survey: [{ HOUSEHOLD_SECTION: ["HOUSEHOLD_SIZE"] }],
      },
    };

    renderWith(<Routes />, options);

    const heading = screen.getByRole("heading");
    expect(heading).toHaveTextContent("survey.intro.title");
  });

  it("routes /app/review to Review", async () => {
    const options = {
      routerOptions: {
        initialEntries: ["/app/review"],
      },
      state: {
        responses: {},
        survey: [],
      },
    };

    renderWith(<Routes />, options);

    const heading = screen.getByRole("heading");
    expect(heading).toHaveTextContent("review.title");
  });

  it("routes /app/review to /app/survey when responses are missing", async () => {
    const options = {
      routerOptions: {
        initialEntries: ["/app/review"],
      },
      state: {
        responses: {},
        survey: [{ HOUSEHOLD_SECTION: ["HOUSEHOLD_SIZE"] }],
      },
    };

    renderWith(<Routes />, options);

    const heading = screen.getByRole("heading");
    expect(heading).toHaveTextContent("survey.intro.title");
  });

  it("routes /app/checks to Checks", async () => {
    const options = {
      routerOptions: {
        initialEntries: ["/app/checks"],
      },
      state: {
        survey: [],
        responses: {},
        questions: {},
      },
    };

    renderWith(<Routes />, options);

    const heading = screen.queryAllByRole("heading");
    expect(heading).toHaveLength(4);
    expect(heading[0]).toHaveTextContent("checks.services.title");
  });

  it("routes /app/services to Services", async () => {
    const options = {
      routerOptions: {
        initialEntries: ["/app/services"],
      },
      state: {
        report: {},
        responses: {
          ADULTS_65_PLUS: true,
          CHILDREN_00_05: false,
          HOUSEHOLD_INCOME: 1000,
          HOUSEHOLD_SIZE: 4,
          IS_EMPLOYED: false,
        },
        serviceData: {
          rank: ["DOL_UA"],
          services: {
            DOL_UA: {
              formula: "=NOT(IS_EMPLOYED)",
            },
          },
        },
        survey: [
          {
            HOUSEHOLD_SECTION: [
              "HOUSEHOLD_SIZE",
              "ADULTS_65_PLUS",
              "CHILDREN_00_05",
            ],
          },
          {
            SECTION_HOUSEHOLD_INCOME: ["HOUSEHOLD_INCOME"],
          },
          {
            SECTION_YOURSELF: ["IS_EMPLOYED"],
          },
        ],
      },
    };

    renderWith(<Routes />, options);

    const headings = screen.getAllByRole("heading");
    expect(headings[0]).toHaveTextContent("services.recommended.title");
  });

  it("routes /app/list to Report", async () => {
    const options = {
      routerOptions: {
        initialEntries: ["/app/list?services=DOL_PUA"],
      },
      state: {
        survey: [],
        serviceData: {
          rank: ["DOL_PUA"],
          services: {
            DOL_PUA: {
              description: "",
              title: "",
              category: "",
            },
          },
        },
      },
    };

    renderWith(<Routes />, options);

    const heading = screen.queryByRole("heading", { name: "report.title" });
    expect(heading).toHaveTextContent("report.title");
  });

  it("routes /app/services to /app/survey when responses are missing", async () => {
    const options = {
      routerOptions: {
        initialEntries: ["/app/services"],
      },
      state: {
        responses: {},
        survey: [{ HOUSEHOLD_SECTION: ["HOUSEHOLD_SIZE"] }],
      },
    };

    renderWith(<Routes />, options);

    const heading = screen.getByRole("heading");
    expect(heading).toHaveTextContent("survey.intro.title");
  });

  it("routes unrecognized routes to the 404 page", async () => {
    const options = {
      routerOptions: {
        initialEntries: ["/app/This_Is/NOT-aRoute"],
      },
      state: {
        responses: {},
        survey: [],
      },
    };
    renderWith(<Routes />, options);

    const headings = screen.getAllByRole("heading");
    expect(headings[0]).toHaveTextContent("http404.error.title");
  });
});
