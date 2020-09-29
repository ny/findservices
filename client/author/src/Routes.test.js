import "@testing-library/jest-dom/extend-expect";
import { screen, waitFor } from "@testing-library/react";
import React from "react";
import { renderWith } from "maslow-shared/src/util/testing";
import Routes from "Routes";
import axios from "axios";

jest.mock("@okta/okta-react", () => ({
  useOktaAuth: () => ({
    authState: { isAuthenticated: true },
    authService: { handleAuthentication: jest.fn() },
  }),
}));
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: () => ({ id: "DOL_UA", lng: "es" }),
}));
jest.mock("axios");

const DOL_UA = {
  modified: "2020-01-01T10:00:00.000Z",
  enabled: true,
  resources: {
    en: {
      name: "Unemployment Assistance",
      category: "",
      description: "",
      preparation: "",
      eligibility: "",
      instructions: "",
    },
    es: {
      name: "Unemployment Assistance",
      category: "",
      description: "",
      preparation: "",
      eligibility: "",
      instructions: "",
    },
  },
  resourceVersions: {
    bn: "hash",
    en: "hash",
    es: "hash",
    ht: "hash",
    ko: "hash",
    ru: "hash",
    zh: "hash",
  },
};
const services = {
  DOL_UA: DOL_UA,
};

describe.skip("Routes", () => {
  afterEach(() => jest.clearAllMocks);
  it("routes / to ManageServices", async () => {
    // @ts-ignore
    axios.get.mockResolvedValue({
      data: { services: services },
    });
    renderWith(<Routes />);

    await waitFor(() => {
      const headings = screen.getAllByRole("heading");
      expect(headings[0]).toHaveTextContent("manageServices.title");
    });
  });

  it("routes /app/services to ManageServices", async () => {
    // @ts-ignore
    axios.get.mockResolvedValue({
      data: { services: services },
    });
    const options = {
      routerOptions: {
        initialEntries: ["/app/services"],
      },
    };

    renderWith(<Routes />, options);

    await waitFor(() => {
      const heading = screen.getByRole("heading");
      expect(heading).toHaveTextContent("manageServices.title");
    });
  });

  it("routes /app/services/create to UpdateService for new service", async () => {
    // @ts-ignore
    axios.get.mockResolvedValueOnce({ data: ["IS_EMPLOYED"] });
    const options = {
      routerOptions: {
        initialEntries: ["/app/services/create"],
      },
    };

    renderWith(<Routes />, options);

    await waitFor(() => {
      const [heading] = screen.getAllByRole("heading");
      expect(heading).toHaveTextContent("updateService.new");
    });
  });

  it("routes /app/services/update/:id to UpdateService", async () => {
    // @ts-ignore
    axios.get
      .mockResolvedValueOnce({ data: ["IS_EMPLOYED"] })
      .mockResolvedValueOnce({
        data: DOL_UA,
      });
    const options = {
      routerOptions: {
        initialEntries: ["/app/services/update/DOL_UA"],
      },
    };

    renderWith(<Routes />, options);

    await waitFor(() => {
      const [heading] = screen.getAllByRole("heading");
      expect(heading).toHaveTextContent("Unemployment Assistance");
    });
  });

  it("routes /app/services/update/:id/locale/:lng to UpdateServiceLocale", async () => {
    // @ts-ignore
    axios.get.mockResolvedValueOnce({
      data: DOL_UA,
    });
    const options = {
      routerOptions: {
        initialEntries: ["/app/services/update/DOL_UA/locale/es"],
      },
    };

    renderWith(<Routes />, options);

    await waitFor(() => {
      const [localeTitle, localeHeading] = screen.getAllByRole("heading");
      expect(localeTitle).toHaveTextContent("updateLocale.title");
      expect(localeHeading).toHaveTextContent("updateLocale.viewLanguage");
    });
  });

  it("routes * to Http404", async () => {
    const options = {
      routerOptions: {
        initialEntries: ["/app/routedoesntexist"],
      },
    };

    renderWith(<Routes />, options);

    const heading = screen.getByRole("heading");
    expect(heading).toHaveTextContent("httpError.title");
  });
});
