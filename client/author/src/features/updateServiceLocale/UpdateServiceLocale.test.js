import "@testing-library/jest-dom/extend-expect";
import React from "react";
import { CustomCodeErrorWithMessage } from "utils/testing";
import { renderWith } from "maslow-shared/src/util/testing";
import { axe, toHaveNoViolations } from "jest-axe";
import axios from "axios";
import UpdateServiceLocale from "features/updateServiceLocale/UpdateServiceLocale";
import userEvent from "@testing-library/user-event";
import { screen, waitFor } from "@testing-library/react";
import routeData from "react-router-dom";

const mockHistoryPush = jest.fn();

jest.mock("@okta/okta-react", () => ({
  useOktaAuth: () => ({
    authState: { isAuthenticated: true },
    authService: { handleAuthentication: jest.fn() },
  }),
}));
jest.mock("axios");
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useHistory: () => ({
    push: mockHistoryPush,
  }),
  useParams: () => ({ id: "DOL_UA", lng: "es" }),
}));

const DOL_UA = {
  rank: 1,
  modified: "2020-01-01T10:00:00.000Z",
  enabled: true,
  applicationUrl: "appURL",
  informationUrl: "infoURL",
  formula: "=IS_EMPLOYMENT_AFFECTED",
  resources: {
    en: {
      name: "Unemployment Assistance",
      category: "Employment",
      description: "Get unemployment aid",
      eligibility: "More eligibility criteria",
      instructions: "How to apply",
    },
    es: {
      name: "Unemployment Español",
      category: "Employment Español",
      description: "Get unemployment Español",
      eligibility: "More eligibility Español",
      instructions: "How to apply Español",
    },
  },
  resourceVersions: {
    bn: "hash",
    en: "hash",
    es: "hash",
    ht: "oldhash",
    ko: "hash",
    ru: "hash",
    // Left out zh to check handling missing translation.
  },
};
expect.extend(toHaveNoViolations);

describe.skip("UpdateServiceLocale", () => {
  let container = null;

  describe.skip("with successful axios get calls", () => {
    beforeEach(async () => {
      axios.get.mockImplementation((url) => {
        switch (url) {
          case "/api/author/v1/services/DOL_UA":
            return Promise.resolve({
              data: DOL_UA,
              headers: { etag: "deadbeef" },
            });
          case "/api/author/v1/services/DOL_UA/locales/en":
            return Promise.resolve({
              data: DOL_UA.resources.en,
              headers: { etag: "deadbeef" },
            });
          case "/api/author/v1/services/DOL_UA/locales/es":
            return Promise.resolve({
              data: DOL_UA.resources.es,
              headers: { etag: "deadbeef" },
            });
          default:
            return Promise.reject({});
        }
      });

      const options = {
        routerOptions: {
          initialEntries: ["/app/services/update/DOL_UA/locale/es"],
        },
      };
      ({ container } = renderWith(<UpdateServiceLocale />, options));

      await waitFor(() => screen.getAllByRole("heading"));
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it("renders with accessible headers", async () => {
      const [localeTitle, localeHeading] = screen.getAllByRole("heading");
      expect(localeTitle).toHaveTextContent("updateLocale.title");
      expect(localeHeading).toHaveTextContent("updateLocale.viewLanguage");
    });

    it("renders with accessible buttons", async () => {
      const [saveTranslation, viewEnglish, viewLanguage] = screen.getAllByRole(
        "button"
      );
      expect(saveTranslation).toHaveTextContent("updateLocale.save");
      // Semantic UI Menu modifies strings separated by periods.
      expect(viewEnglish).toHaveTextContent("Update Locale View English");
      expect(viewLanguage).toHaveTextContent("Update Locale Preview Language");
    });

    it("makes an axios call to get the service data", async () => {
      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledTimes(2);
        expect(axios.get).toHaveBeenCalledWith(
          "/api/author/v1/services/DOL_UA"
        );
        expect(axios.get).toHaveBeenCalledWith(
          "/api/author/v1/services/DOL_UA/locales/es"
        );
      });
    });

    it("renders all textbox form fields in both languages", async () => {
      const textboxes = screen.getAllByRole("textbox");
      expect(textboxes).toHaveLength(12);
      const [name, englishName] = screen.queryAllByLabelText(
        "updateService.name.title"
      );
      expect(name).toBeInTheDocument();
      expect(englishName).toBeInTheDocument();
      const [category, englishCategory] = screen.queryAllByText(
        "updateService.category.title"
      );
      expect(category).toBeInTheDocument();
      expect(englishCategory).toBeInTheDocument();
      const [description, englishDescription] = screen.queryAllByText(
        "updateService.description.title"
      );
      expect(description).toBeInTheDocument();
      expect(englishDescription).toBeInTheDocument();
      const [eligibility, englishEligibility] = screen.queryAllByText(
        "updateService.eligibility.title"
      );
      expect(eligibility).toBeInTheDocument();
      expect(englishEligibility).toBeInTheDocument();
      const [instructions, englishInstructions] = screen.queryAllByText(
        "updateService.instructions.title"
      );
      expect(instructions).toBeInTheDocument();
      expect(englishInstructions).toBeInTheDocument();
    });

    it("renders save button and handles button being clicked after input is changed", async () => {
      const [localeDescription] = screen.getAllByRole("textbox", {
        name: "updateService.description.title",
      });
      userEvent.clear(localeDescription);
      userEvent.type(localeDescription, "New description "); // Trailing whitespace should be removed on save
      const [saveButton] = screen.getAllByRole("button");
      expect(saveButton).toHaveTextContent("updateLocale.save");
      userEvent.click(saveButton);
      expect(axios.put).toHaveBeenCalledTimes(1);

      const localeUpdate = Object.assign({}, DOL_UA.resources.es);
      localeUpdate.description = "New description";

      expect(
        axios.put
      ).toHaveBeenCalledWith(
        "/api/author/v1/services/DOL_UA/locales/es",
        localeUpdate,
        { headers: { "If-Match": "deadbeef" } }
      );
      await waitFor(() => {
        expect(mockHistoryPush).toHaveBeenCalledTimes(1);
        expect(mockHistoryPush).toHaveBeenCalledWith({
          pathname: "/app/services/update/DOL_UA",
          state: {
            updateMessage: "updateService.saveMessage",
          },
        });
      });
    });

    it("handles error on clicking save button and dismisses error message", async () => {
      axios.put.mockImplementationOnce(() =>
        Promise.reject(new Error("generic error"))
      );
      const [saveButton] = screen.getAllByRole("button");
      expect(saveButton).toHaveTextContent("updateLocale.save");

      // Don't log the mocked axios error.
      jest.spyOn(console, "error").mockImplementationOnce(() => {});

      userEvent.click(saveButton);
      expect(axios.put).toHaveBeenCalledTimes(1);

      let message = undefined;
      await waitFor(() => {
        message = screen.getByRole("status");
        expect(message).toBeInTheDocument();
        expect(message).toHaveTextContent("httpError.saveFailed");
      });
      userEvent.click(message.children[0]); // Click the 'X'.
      await waitFor(() => {
        message = screen.queryByRole("status");
        expect(message).not.toBeInTheDocument();
      });
    });

    it("handles concurrent edit error on clicking save button", async () => {
      axios.put.mockImplementationOnce(() =>
        Promise.reject(
          new CustomCodeErrorWithMessage(
            "CONCURRENT_EDIT: editing happening",
            409
          )
        )
      );
      const [saveButton] = screen.getAllByRole("button");
      expect(saveButton).toHaveTextContent("updateLocale.save");

      // Don't log the mocked axios error.
      jest.spyOn(console, "error").mockImplementationOnce(() => {});

      userEvent.click(saveButton);
      expect(axios.put).toHaveBeenCalledTimes(1);
      await waitFor(() => {
        const message = screen.getByRole("status");
        expect(message).toBeInTheDocument();
        expect(message).toHaveTextContent("httpError.concurrentEdit");
      });
    });

    it("updates successfully after initial locale validation error", async () => {
      // Clear the last locale field.
      const [localeEligibility] = screen.getAllByRole("textbox", {
        name: "updateService.eligibility.title",
      });
      userEvent.clear(localeEligibility);

      // Click save.
      const [saveButton] = screen.getAllByRole("button");
      expect(saveButton).toHaveTextContent("updateLocale.save");
      userEvent.click(saveButton);

      // Validation message appears since en entry has one more field filled
      // in that the locale does not.
      const [message] = screen.queryAllByRole("status");
      expect(message).toBeInTheDocument();
      expect(message).toHaveTextContent("validationError");

      userEvent.click(message.children[0]); // Click the 'X'.
      await waitFor(() => {
        const message = screen.queryByRole("status");
        expect(message).not.toBeInTheDocument();
      });

      // Update the last missing field and click the "save" button again.
      userEvent.type(localeEligibility, "Locale eligibility value");
      userEvent.click(saveButton);
      expect(axios.put).toHaveBeenCalledTimes(1);
      await waitFor(() => {
        expect(mockHistoryPush).toHaveBeenCalledTimes(1);
        expect(mockHistoryPush).toHaveBeenCalledWith({
          pathname: "/app/services/update/DOL_UA",
          state: {
            updateMessage: "updateService.saveMessage",
          },
        });
      });
    });

    it("renders preview once button is clicked", async () => {
      const [, , previewButton] = screen.getAllByRole("button");
      userEvent.click(previewButton);

      const [, , cardHeader] = screen.getAllByRole("heading");
      expect(cardHeader).toHaveTextContent("Unemployment Español");
      const category = screen.queryByText("Employment Español");
      expect(category).toBeInTheDocument();
      const readyToApply = screen.queryByText("report.apply.ready");
      expect(readyToApply).toBeInTheDocument();
      const additionalCriteria = screen.queryByText("report.apply.criteria");
      expect(additionalCriteria).toBeInTheDocument();
    });

    it("has no a11y violations", async () => {
      expect(await axe(container)).toHaveNoViolations();
    });
  });

  describe.skip("with empty spanish translations", () => {
    beforeEach(async () => {
      const noSpanishData = {
        // Remove spanish translations from simulated server response
        ...DOL_UA,
        resources: { ...DOL_UA.resources, es: undefined },
        resourceVersions: { ...DOL_UA.resourceVersions, es: undefined },
      };

      // @ts-ignore
      axios.get.mockImplementation((url) => {
        switch (url) {
          case "/api/author/v1/services/DOL_UA":
            return Promise.resolve({
              data: noSpanishData,
            });
          case "/api/author/v1/services/DOL_UA/locales/en":
            return Promise.resolve({
              data: DOL_UA.resources.en,
              headers: { etag: "deadbeef" },
            });
          case "/api/author/v1/services/DOL_UA/locales/es":
            return Promise.reject(
              new CustomCodeErrorWithMessage("RESOURCE_NOT_FOUND: es", 404)
            );
          default:
            return Promise.reject({});
        }
      });
      const options = {
        routerOptions: {
          initialEntries: ["/app/services/update/DOL_UA/locale/es"],
        },
      };
      ({ container } = renderWith(<UpdateServiceLocale />, options));

      await waitFor(() => screen.getAllByRole("heading"));
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it("renders with accessible headers", async () => {
      const [localeTitle, localeHeading] = screen.getAllByRole("heading");
      expect(localeTitle).toHaveTextContent("updateLocale.title");
      expect(localeHeading).toHaveTextContent("updateLocale.viewLanguage");
    });

    it("renders with accessible buttons", async () => {
      const [saveTranslation, viewEnglish, viewLanguage] = screen.getAllByRole(
        "button"
      );
      expect(saveTranslation).toHaveTextContent("updateLocale.save");
      // Semantic UI Menu modifies strings separated by periods.
      expect(viewEnglish).toHaveTextContent("Update Locale View English");
      expect(viewLanguage).toHaveTextContent("Update Locale Preview Language");
    });

    it("handles validation error for missing translation fields", async () => {
      // No validation/error messages displayed on page load.
      let validationMessage = screen.queryByRole("status");
      let descriptionMessages = screen.queryAllByRole("alert");
      expect(validationMessage).not.toBeInTheDocument();
      expect(descriptionMessages).toHaveLength(0);

      // Click save without filling in locale fields.
      const [saveButton] = screen.getAllByRole("button");
      expect(saveButton).toHaveTextContent("updateLocale.save");
      userEvent.click(saveButton);

      // Validation message and error messages appear since the corresponding
      // en fields are filled, so the locale ones must be too.
      validationMessage = await screen.findByRole("status");
      descriptionMessages = screen.queryAllByRole("alert");
      expect(validationMessage).toBeInTheDocument();
      expect(validationMessage).toHaveTextContent("validationError");
      expect(descriptionMessages).toHaveLength(5); // number of english fields
      expect(descriptionMessages[0]).toBeInTheDocument();
      expect(descriptionMessages[0]).toHaveTextContent("missingFieldError");
    });

    it("handles save button being clicked after input is changed", async () => {
      const [
        name,
        category,
        description,
        eligibility,
        instructions,
        ,
      ] = screen.getAllByRole("textbox");
      userEvent.type(name, "Name");
      userEvent.type(category, "Category");
      userEvent.type(description, "Description");
      userEvent.type(eligibility, "Eligibility");
      userEvent.type(instructions, "Instructions");
      const [saveButton] = screen.getAllByRole("button");
      expect(saveButton).toHaveTextContent("updateLocale.save");
      userEvent.click(saveButton);
      expect(axios.put).toHaveBeenCalledTimes(1);

      const localeUpdate = {
        name: "Name",
        category: "Category",
        description: "Description",
        eligibility: "Eligibility",
        instructions: "Instructions",
        // TODO: this field should not be showing up here, but it is.
        // Potentially an underlying bug but all behavior is currently as
        // expected.
        preparation: "",
      };

      expect(axios.put).toHaveBeenCalledWith(
        "/api/author/v1/services/DOL_UA/locales/es",
        localeUpdate,
        {}
      );
      await waitFor(() => {
        expect(mockHistoryPush).toHaveBeenCalledTimes(1);
        expect(mockHistoryPush).toHaveBeenCalledWith({
          pathname: "/app/services/update/DOL_UA",
          state: {
            updateMessage: "updateService.saveMessage",
          },
        });
      });
    });
  });

  describe.skip("with generic unsuccessful axios call for get service", () => {
    beforeEach(async () => {
      // @ts-ignore
      axios.get.mockImplementation(() => {
        return Promise.reject(new Error("not found"));
      });
      const options = {
        routerOptions: {
          initialEntries: ["/app/services/update/DOL_UA/locale/es"],
        },
      };

      // Don't log the mocked axios error.
      jest.spyOn(console, "error").mockImplementationOnce(() => {});
      ({ container } = renderWith(<UpdateServiceLocale />, options));

      await waitFor(() => screen.getAllByRole("heading"));
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it("displays generic error from failing to get service", async () => {
      const header = screen.getByRole("heading");
      const content = screen.getByRole("region");

      expect(header).toHaveTextContent("httpError.title");
      expect(content).toHaveTextContent("httpError.generic");
    });
  });

  describe.skip("with 404 unsuccessful axios call for get service", () => {
    beforeEach(async () => {
      // @ts-ignore
      axios.get.mockImplementation(() => {
        return Promise.reject(
          new CustomCodeErrorWithMessage(
            "SERVICE_NOT_FOUND: service not found",
            404
          )
        );
      });
      const options = {
        routerOptions: {
          initialEntries: ["/app/services/update/DOL_UA/locale/es"],
        },
      };

      // Don't log the mocked axios error.
      jest.spyOn(console, "error").mockImplementationOnce(() => {});
      ({ container } = renderWith(<UpdateServiceLocale />, options));

      await waitFor(() => screen.getAllByRole("heading"));
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it("displays 404 error from failing to get service", async () => {
      const header = screen.getByRole("heading");
      const content = screen.getByRole("region");

      expect(header).toHaveTextContent("httpError.title");
      expect(content).toHaveTextContent("httpError.missingServiceForLocale");
    });
  });

  describe.skip("with 404 because language doesn't exist", () => {
    beforeEach(async () => {
      // @ts-ignore
      axios.get.mockImplementation((url) => {
        switch (url) {
          case "/api/author/v1/services/DOL_UA/locales/en":
            return Promise.resolve({
              data: DOL_UA.resources.en,
            });
          case "/api/author/v1/services/DOL_UA/locales/es":
            return Promise.resolve({
              data: DOL_UA.resources.es,
            });
          default:
            return Promise.reject({});
        }
      });
      const options = {
        routerOptions: {
          initialEntries: ["/app/services/update/DOL_UA/locale/FAKE"],
        },
      };

      const spy = jest
        .spyOn(routeData, "useParams")
        // @ts-ignore
        .mockReturnValue({ id: "DOL_UA", lng: "FAKE" });

      ({ container } = renderWith(<UpdateServiceLocale />, options));

      spy.mockRestore();

      await waitFor(() => screen.getAllByRole("heading"));
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it("displays 404 error from failing to recognize language", async () => {
      const header = screen.getByRole("heading");
      const content = screen.getByRole("region");

      expect(header).toHaveTextContent("httpError.title");
      expect(content).toHaveTextContent("httpError.missingLocale");
    });
  });
});
