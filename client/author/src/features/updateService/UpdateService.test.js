import "@testing-library/jest-dom/extend-expect";
import React from "react";
import { renderWith } from "maslow-shared/src/util/testing";
import { CustomCodeErrorWithMessage } from "utils/testing";
import { axe, toHaveNoViolations } from "jest-axe";
import axios from "axios";
import UpdateService from "features/updateService/UpdateService";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mockHistoryPush = jest.fn();

jest.mock("axios");
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useHistory: () => ({
    push: mockHistoryPush,
  }),
  useParams: () => ({ id: "DOL_UA" }),
  useLocation: () => {
    return {
      pathname: "/app/services/update/DOL_UA",
      state: { updateMessage: "Your changes have been saved." },
    };
  },
}));

const DOL_UA = {
  key: "DOL_UA",
  rank: 1,
  modified: "2020-01-01T10:00:00.000Z",
  enabled: false,
  applicationUrl: "",
  informationUrl: "https://www.infoURL.com/slash",
  formula: "=IS_EMPLOYMENT_AFFECTED",
  resources: {
    en: {
      name: "Unemployment Assistance",
      category: "Employment",
      description: "Get unemployment aid",
      eligibility: "More eligibility criteria",
      instructions: "How to apply",
    },
  },
  resourceVersions: {
    bn: "hash",
    en: "hash",
    es: "oldhash",
    ht: "hash",
    ko: "hash",
    ru: "hash",
    // Left out zh to check handling missing translation.
  },
};

expect.extend(toHaveNoViolations);

describe("UpdateService", () => {
  let container = null;

  describe("for existing service", () => {
    describe("with successful axios get calls", () => {
      beforeEach(async () => {
        // @ts-ignore
        axios.get.mockImplementation((url) => {
          switch (url) {
            case "/api/author/v1/services/DOL_UA":
              return Promise.resolve({
                data: DOL_UA,
                headers: { ETag: "deadbeef" },
              });
            case "/api/author/v1/lookup/questions":
              return Promise.resolve({
                data: ["IS_EMPLOYED", "IS_EMPLOYMENT_AFFECTED"],
              });
            default:
              return Promise.reject(new Error("not found"));
          }
        });

        const options = {
          routerOptions: {
            initialEntries: ["/app/services/update/DOL_UA"],
          },
        };
        ({ container } = renderWith(<UpdateService />, options));

        await waitFor(() => {
          screen.getAllByRole("heading", {
            name: "Unemployment Assistance",
          });
        });
      });

      afterEach(() => {
        jest.clearAllMocks();
      });

      it("renders with accessible headers", async () => {
        const [mainHeader, previewHeader] = screen.getAllByRole("heading");
        expect(mainHeader).toHaveTextContent("Unemployment Assistance");
        expect(previewHeader).toHaveTextContent("updateService.preview");
      });

      it("renders correct textbox form fields", async () => {
        const textboxes = screen.getAllByRole("textbox");
        expect(textboxes).toHaveLength(10);
        const key = screen.queryByLabelText("updateService.serviceKey.title");
        expect(key).toBeInTheDocument();
        expect(key).toHaveAttribute("readOnly");
        const name = screen.queryByLabelText("updateService.name.title");
        expect(name).toBeInTheDocument();
        const category = screen.queryByLabelText(
          "updateService.category.title"
        );
        expect(category).toBeInTheDocument();
        const desc = screen.queryByLabelText("updateService.description.title");
        expect(desc).toBeInTheDocument();
        const eligibility = screen.queryByLabelText(
          "updateService.eligibility.title"
        );
        expect(eligibility).toBeInTheDocument();
        const infoURL = screen.queryByLabelText("updateService.infoURL.title");
        expect(infoURL).toBeInTheDocument();
        const instructions = screen.queryByLabelText(
          "updateService.instructions.title"
        );
        expect(instructions).toBeInTheDocument();
        const appURL = screen.queryByLabelText("updateService.appURL.title");
        expect(appURL).toBeInTheDocument();
        const prep = screen.queryByLabelText("updateService.preparation.title");
        expect(prep).toBeInTheDocument();
        const formula = screen.queryByLabelText("updateService.formula.title");
        expect(formula).toBeInTheDocument();
      });

      it("renders correct toggle form fields", async () => {
        const [visibilityToggle, markUpToDate] = screen.getAllByRole(
          "checkbox"
        );
        expect(visibilityToggle).not.toHaveAttribute("checked");
        expect(markUpToDate).not.toHaveAttribute("checked");
      });

      it("renders translation status table", async () => {
        // Check all cells in the first row besides the last one, which
        // contains a link tested elsewhere. In the other rows, just check
        // cells that include logic which needs checking.
        const [
          lng1,
          translationStatus1,
          ,
          ,
          translationStatus2,
          ,
          ,
          translationStatus3,
          ,
          ,
          translationStatus4,
          ,
          ,
          translationStatus5,
          ,
          ,
          translationStatus6,
          ,
          ,
        ] = screen.getAllByRole("cell");
        expect(lng1).toHaveTextContent("Bengali (bn)");
        expect(translationStatus1).toHaveTextContent(
          "manageServices.translated"
        );
        expect(translationStatus2).toHaveTextContent("manageServices.outdated");
        expect(translationStatus3).toHaveTextContent(
          "manageServices.translated"
        );
        expect(translationStatus4).toHaveTextContent(
          "manageServices.translated"
        );
        expect(translationStatus5).toHaveTextContent(
          "manageServices.translated"
        );
        expect(translationStatus6).toHaveTextContent(
          "manageServices.notTranslated"
        );
      });

      it("renders the correct links", async () => {
        const [allServices, edit1, edit2] = screen.getAllByRole("link");
        expect(allServices).toHaveAttribute("href", "/app/services");
        expect(edit1).toHaveAttribute(
          "href",
          "/app/services/update/DOL_UA/locale/bn"
        );
        expect(edit2).toHaveAttribute(
          "href",
          "/app/services/update/DOL_UA/locale/es"
        );
      });

      it("renders hidden tag when service is not visible, but not when it is visible", async () => {
        const hiddenTag = screen.queryByText("updateService.hidden");
        expect(hiddenTag).toBeInTheDocument();
        const visibility = screen.getByRole("checkbox", {
          name: "updateService.visibility.title",
        });
        userEvent.click(visibility);
        await waitFor(() => {
          const hiddenTag = screen.queryByText("updateService.hidden");
          expect(hiddenTag).not.toBeInTheDocument();
        });
      });

      it("renders success update message and dismisses it", async () => {
        const updateMessage = screen.getByRole("status");
        expect(updateMessage).toHaveTextContent("Your changes have been saved");
        userEvent.click(updateMessage.children[0]); // Click the 'X'.
        await waitFor(() => {
          const updateMessage = screen.queryByRole("status");
          expect(updateMessage).not.toBeInTheDocument();
        });
      });

      it("renders save button and handles button being clicked after input is changed", async () => {
        axios.put.mockImplementationOnce(() => Promise.resolve({}));
        const description = screen.getByRole("textbox", {
          name: "updateService.description.title",
        });
        userEvent.clear(description);
        userEvent.type(description, "New description "); // Trailing whitespace should be removed on save
        const appURL = screen.getByRole("textbox", {
          name: "updateService.appURL.title",
        });
        userEvent.type(appURL, "https://url.com");
        const [saveButton] = screen.getAllByRole("button");
        expect(saveButton).toHaveTextContent("updateService.save");
        userEvent.click(saveButton);
        expect(axios.put).toHaveBeenCalledTimes(1);
        const serviceSent = Object.assign({}, DOL_UA);
        serviceSent.resources.en.description = "New description";
        serviceSent.applicationUrl = "https://url.com";
        expect(axios.put).toHaveBeenCalledWith(
          "/api/author/v1/services/DOL_UA",
          serviceSent,
          { headers: { "If-Match": "" } }
        );
        await waitFor(() => {
          expect(mockHistoryPush).toHaveBeenCalledTimes(1);
          expect(mockHistoryPush).toHaveBeenCalledWith({
            pathname: "/app/services",
            state: {
              updateMessage: "manageServices.saveMessage",
            },
          });
        });
      });

      it("handles save with mark all languages as up to date", async () => {
        axios.put.mockImplementationOnce(() => Promise.resolve({}));
        const [, markUpToDate] = screen.getAllByRole("checkbox");
        userEvent.click(markUpToDate);

        const [saveButton] = screen.getAllByRole("button");
        expect(saveButton).toHaveTextContent("updateService.save");
        userEvent.click(saveButton);

        await waitFor(() => {
          expect(axios.put).toHaveBeenCalledTimes(1);
          expect(axios.post).toHaveBeenCalledTimes(1);
        });

        const serviceSent = Object.assign({}, DOL_UA);
        expect(axios.put).toHaveBeenCalledWith(
          "/api/author/v1/services/DOL_UA",
          serviceSent,
          { headers: { "If-Match": "" } }
        );
        expect(axios.post).toHaveBeenCalledWith(
          "/api/author/v1/services/DOL_UA/locales:update"
        );

        expect(mockHistoryPush).toHaveBeenCalledTimes(1);
        expect(mockHistoryPush).toHaveBeenCalledWith({
          pathname: "/app/services",
          state: {
            updateMessage: "manageServices.saveMessage",
          },
        });
      });

      it("handles error on clicking save button and dismisses error message", async () => {
        // First there is a positive update message.
        const updateMessage = screen.getByRole("status");
        expect(updateMessage).toHaveTextContent("Your changes have been saved");

        axios.put.mockImplementationOnce(() =>
          Promise.reject(new Error("generic error"))
        );
        const [saveButton] = screen.getAllByRole("button");
        expect(saveButton).toHaveTextContent("updateService.save");

        // Don't log the mocked axios error.
        jest.spyOn(console, "error").mockImplementationOnce(() => {});

        userEvent.click(saveButton);
        expect(axios.put).toHaveBeenCalledTimes(1);

        // Then the positive update message gets replaced by the negative save
        // message.
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

      it("handles error on clicking save button for marking all languages as up to date", async () => {
        axios.post.mockImplementationOnce(() =>
          Promise.reject(new Error("generic error"))
        );
        const [, markUpToDate] = screen.getAllByRole("checkbox");
        userEvent.click(markUpToDate);

        const [saveButton] = screen.getAllByRole("button");
        expect(saveButton).toHaveTextContent("updateService.save");

        // Don't log the mocked axios error.
        jest.spyOn(console, "error").mockImplementationOnce(() => {});

        userEvent.click(saveButton);

        // Then the positive update message gets replaced by the negative save
        // message.
        await waitFor(() => {
          expect(axios.put).toHaveBeenCalledTimes(1);
          expect(axios.post).toHaveBeenCalledTimes(1);

          const message = screen.getByRole("status");
          expect(message).toBeInTheDocument();
          expect(message).toHaveTextContent("httpError.saveFailed");
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
        expect(saveButton).toHaveTextContent("updateService.save");

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

      it("handles save when service is visible", async () => {
        axios.put.mockImplementationOnce(() => Promise.resolve({}));
        const [visible] = screen.getAllByRole("checkbox");
        userEvent.click(visible);

        const [saveButton] = screen.queryAllByRole("button");
        expect(saveButton).toBeInTheDocument();
        userEvent.click(saveButton);

        // Check modal
        const modalHeading = screen.queryByRole("heading", {
          name: "updateService.confirmChanges",
        });
        expect(modalHeading).toBeInTheDocument();
        let [, , noButton, yesButton] = screen.getAllByRole("button");
        expect(noButton).toHaveTextContent("updateService.no");
        expect(yesButton).toHaveTextContent("updateService.yes");

        // Dismiss modal
        userEvent.click(noButton);
        await waitFor(() => expect(modalHeading).not.toBeInTheDocument());

        // Resave
        await waitFor(() => expect(saveButton).toBeInTheDocument());
        userEvent.click(saveButton);

        await waitFor(() => {
          [, , , yesButton] = screen.getAllByRole("button");
          expect(yesButton).toBeInTheDocument();
        });
        userEvent.click(yesButton);

        await waitFor(() => {
          expect(axios.put).toHaveBeenCalledTimes(1);
          const serviceSent = Object.assign({}, DOL_UA);
          serviceSent.enabled = true;
          expect(
            axios.put
          ).toHaveBeenCalledWith(
            "/api/author/v1/services/DOL_UA",
            serviceSent,
            { headers: { "If-Match": "" } }
          );
          expect(mockHistoryPush).toHaveBeenCalledTimes(1);
          expect(mockHistoryPush).toHaveBeenCalledWith({
            pathname: "/app/services",
            state: {
              updateMessage: "manageServices.saveMessage",
            },
          });
        });
      });

      it("handles save when service is visible but there are validation errors", async () => {
        const [visible] = screen.getAllByRole("checkbox");
        userEvent.click(visible);

        const description = screen.getByRole("textbox", {
          name: "updateService.description.title",
        });
        userEvent.clear(description);
        const appURL = screen.getByRole("textbox", {
          name: "updateService.appURL.title",
        });
        userEvent.type(appURL, "invalid format");

        const [saveButton] = screen.getAllByRole("button");
        userEvent.click(saveButton);

        // Check that modal does not appear
        const modalHeading = screen.queryByRole("heading", {
          name: "updateService.confirmChanges",
        });
        expect(modalHeading).not.toBeInTheDocument();

        // Check that validation message does appear
        const pageValidationError = screen.getByRole("status");
        expect(pageValidationError).toHaveTextContent("validationError");
        const [descValidation, appURLValidation] = screen.getAllByRole("alert");
        expect(descValidation).toHaveTextContent("missingFieldError");
        expect(appURLValidation).toHaveTextContent(
          "updateService.appURL.error"
        );
      });

      it("handles save when there is a validation error from text with just spaces", async () => {
        const description = screen.getByRole("textbox", {
          name: "updateService.description.title",
        });
        userEvent.clear(description);
        userEvent.type(description, "  ");

        const [saveButton] = screen.getAllByRole("button");
        userEvent.click(saveButton);

        // Check that validation message does appear
        const pageValidationError = screen.getByRole("status");
        expect(pageValidationError).toHaveTextContent("validationError");
        const [descriptionValidation] = screen.getAllByRole("alert");
        expect(descriptionValidation).toHaveTextContent("missingFieldError");
      });

      it("renders validate button and handles button being clicked with valid formula", async () => {
        const [, validateButton] = screen.getAllByRole("button");
        expect(validateButton).toHaveTextContent(
          "updateService.formula.validate"
        );
        userEvent.click(validateButton);
        await waitFor(() => {
          const validationMsg = screen.queryByRole("alert");
          expect(validationMsg).toBeInTheDocument();
          expect(validationMsg).toHaveTextContent(
            "updateService.formula.success"
          );
        });
      });

      it("handles validate button being clicked with empty, not trimmed formula", async () => {
        const [, validateButton] = screen.getAllByRole("button");
        const formulaInput = screen.getByRole("textbox", {
          name: "updateService.formula.title",
        });
        userEvent.clear(formulaInput);
        userEvent.type(formulaInput, "  ");
        expect(formulaInput).toHaveAttribute("name", "  ");
        userEvent.click(validateButton);
        await waitFor(() => {
          const validationMsg = screen.queryByRole("alert");
          expect(validationMsg).toBeInTheDocument();
          expect(validationMsg).toHaveTextContent(
            "updateService.formula.success"
          );
        });
      });

      it("handles validate button being clicked with invalid formula", async () => {
        const [, validateButton] = screen.getAllByRole("button");
        const formulaInput = screen.getByRole("textbox", {
          name: "updateService.formula.title",
        });
        userEvent.clear(formulaInput);
        userEvent.type(formulaInput, "=DOES_NOT_EXIST");
        expect(formulaInput).toHaveAttribute("name", "=DOES_NOT_EXIST");
        userEvent.click(validateButton);
        await waitFor(() => {
          const validationMsg = screen.queryByRole("alert");
          expect(validationMsg).toBeInTheDocument();
          expect(validationMsg).toHaveTextContent(
            "Errors detected! Unknown variable: 'DOES_NOT_EXIST'"
          );
        });
        userEvent.type(formulaInput, "{backspace}");
        const validationMsg = screen.queryByRole("alert");
        expect(validationMsg).not.toBeInTheDocument();
      });

      it("renders the formula guidelines", async () => {
        const formulaGuidelines = screen.getByRole("region");
        expect(formulaGuidelines).toHaveTextContent(
          /updateService.formula.guidelines.introduction/
        );
        const questionList = screen.getAllByLabelText(/questionlist-.*/);
        expect(questionList).toHaveLength(2);
      });

      it("makes an axios call to get the service", async () => {
        await waitFor(() => {
          expect(axios.get).toHaveBeenCalledTimes(2);
          expect(axios.get).toHaveBeenCalledWith(
            "/api/author/v1/services/DOL_UA"
          );
          expect(axios.get).toHaveBeenCalledWith(
            "/api/author/v1/lookup/questions"
          );
        });
      });

      it("renders report card correctly", async () => {
        const [, , cardHeader] = screen.getAllByRole("heading");
        expect(cardHeader).toHaveTextContent("Unemployment Assistance");
        const category = screen.queryByText("Employment");
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

    describe("with generic unsuccessful axios call for get service", () => {
      beforeEach(async () => {
        // @ts-ignore
        axios.get.mockImplementation((url) => {
          switch (url) {
            case "/api/author/v1/lookup/questions":
              return Promise.resolve({
                data: ["IS_EMPLOYED", "IS_EMPLOYMENT_AFFECTED"],
              });
            default:
              return Promise.reject(new Error("not found"));
          }
        });
        const options = {
          routerOptions: {
            initialEntries: ["/app/services/update/DOL_UA"],
          },
        };

        // Don't log the mocked axios error.
        jest.spyOn(console, "error").mockImplementationOnce(() => {});
        ({ container } = renderWith(<UpdateService />, options));

        screen.findAllByRole("heading");
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

    describe("with 404 unsuccessful axios call for get service", () => {
      beforeEach(async () => {
        // @ts-ignore
        axios.get.mockImplementation((url) => {
          switch (url) {
            case "/api/author/v1/lookup/questions":
              return Promise.resolve({
                data: ["IS_EMPLOYED", "IS_EMPLOYMENT_AFFECTED"],
              });
            default:
              return Promise.reject(
                new CustomCodeErrorWithMessage(
                  "SERVICE_NOT_FOUND: Service not found",
                  404
                )
              );
          }
        });
        const options = {
          routerOptions: {
            initialEntries: ["/app/services/update/DOL_UA"],
          },
        };

        // Don't log the mocked axios error.
        jest.spyOn(console, "error").mockImplementationOnce(() => {});
        ({ container } = renderWith(<UpdateService />, options));

        screen.findAllByRole("heading");
      });

      afterEach(() => {
        jest.clearAllMocks();
      });

      it("displays 404 error from failing to get service", async () => {
        const header = screen.getByRole("heading");
        const content = screen.getByRole("region");

        expect(header).toHaveTextContent("httpError.title");
        expect(content).toHaveTextContent("httpError.missingService");
      });
    });

    describe("with generic unsuccessful axios call for get questions", () => {
      beforeEach(async () => {
        // @ts-ignore
        axios.get.mockImplementation((url) => {
          switch (url) {
            case "/api/author/v1/services/DOL_UA":
              return Promise.resolve({
                data: DOL_UA,
              });
            default:
              return Promise.reject(new Error("error"));
          }
        });
        const options = {
          routerOptions: {
            initialEntries: ["/app/services/update/DOL_UA"],
          },
        };
        ({ container } = renderWith(<UpdateService />, options));

        screen.findAllByRole("heading");
      });

      afterEach(() => {
        jest.clearAllMocks();
      });

      it("displays generic error from failing to get questions", async () => {
        const header = screen.getByRole("heading");
        const content = screen.getByRole("region");

        expect(header).toHaveTextContent("httpError.title");
        expect(content).toHaveTextContent("httpError.generic");
      });
    });
  });

  describe("for new service", () => {
    describe("with successful axios calls", () => {
      beforeEach(async () => {
        // @ts-ignore
        axios.get.mockImplementation((url) => {
          switch (url) {
            case "/api/author/v1/lookup/questions":
              return Promise.resolve({
                data: ["IS_EMPLOYED", "IS_EMPLOYMENT_AFFECTED"],
              });
            default:
              return Promise.reject(new Error("not found"));
          }
        });
        const options = {
          routerOptions: {
            initialEntries: ["/app/services/create"],
          },
        };
        ({ container } = renderWith(<UpdateService isNew={true} />, options));

        await waitFor(() => {
          screen.getAllByRole("heading", { name: "updateService.new" });
        });
      });

      afterEach(() => {
        jest.clearAllMocks();
      });

      it("renders with accessible headers", async () => {
        const [mainHeader, previewHeader] = screen.getAllByRole("heading");
        expect(mainHeader).toHaveTextContent("updateService.new");
        expect(previewHeader).toHaveTextContent("updateService.preview");
      });

      it("renders correct textbox form fields", async () => {
        const textboxes = screen.getAllByRole("textbox");
        expect(textboxes).toHaveLength(10);
        const key = screen.queryByLabelText("updateService.serviceKey.title");
        expect(key).toBeInTheDocument();
        expect(key).not.toHaveAttribute("readOnly");
        const name = screen.queryByLabelText("updateService.name.title");
        expect(name).toBeInTheDocument();
        const category = screen.queryByLabelText(
          "updateService.category.title"
        );
        expect(category).toBeInTheDocument();
        const desc = screen.queryByLabelText("updateService.description.title");
        expect(desc).toBeInTheDocument();
        const eligibility = screen.queryByLabelText(
          "updateService.eligibility.title"
        );
        expect(eligibility).toBeInTheDocument();
        const infoURL = screen.queryByLabelText("updateService.infoURL.title");
        expect(infoURL).toBeInTheDocument();
        const instructions = screen.queryByLabelText(
          "updateService.instructions.title"
        );
        expect(instructions).toBeInTheDocument();
        const appURL = screen.queryByLabelText("updateService.appURL.title");
        expect(appURL).toBeInTheDocument();
        const prep = screen.queryByLabelText("updateService.preparation.title");
        expect(prep).toBeInTheDocument();
        const formula = screen.queryByLabelText("updateService.formula.title");
        expect(formula).toBeInTheDocument();
      });

      it("renders correct toggle form fields", async () => {
        const visibilityToggle = screen.getByRole("checkbox");
        expect(visibilityToggle).not.toHaveAttribute("checked");
      });

      it("renders translation status message", async () => {
        const transMessage = screen.getByText(
          "updateService.translationMessage"
        );
        expect(transMessage).toBeDefined();
      });

      it("renders the correct links", async () => {
        const [allServices] = screen.getAllByRole("link");
        expect(allServices).toHaveAttribute("href", "/app/services");
      });

      it("renders add details message before any details have been added", async () => {
        const addDetails = screen.queryByText("updateService.addDetails");
        expect(addDetails).toBeInTheDocument();
      });

      it("renders save button and handles button being clicked after input is changed", async () => {
        const ID = screen.getByRole("textbox", {
          name: "updateService.serviceKey.title",
        });
        const name = screen.getByRole("textbox", {
          name: "updateService.name.title",
        });
        const category = screen.getByRole("textbox", {
          name: "updateService.category.title",
        });
        const description = screen.getByRole("textbox", {
          name: "updateService.description.title",
        });
        const infoURL = screen.getByRole("textbox", {
          name: "updateService.infoURL.title",
        });
        const formula = screen.getByRole("textbox", {
          name: "updateService.formula.title",
        });

        userEvent.type(ID, "NEW_ID");
        userEvent.type(name, "new name ");
        userEvent.type(category, "new category ");
        userEvent.type(description, "new description ");
        userEvent.type(infoURL, "https://www.url.com/slash");
        userEvent.type(formula, "=IS_EMPLOYED ");

        const [saveButton] = screen.getAllByRole("button");
        expect(saveButton).toHaveTextContent("updateService.save");
        userEvent.click(saveButton);
        expect(axios.post).toHaveBeenCalledTimes(1);
        const serviceSent = {
          key: "NEW_ID",
          informationUrl: "https://www.url.com/slash",
          enabled: false,
          applicationUrl: "",
          formula: "=IS_EMPLOYED",
          rank: -1,
          resources: {
            en: {
              name: "new name",
              category: "new category",
              description: "new description",
              eligibility: "",
              instructions: "",
              preparation: "",
            },
          },
        };
        expect(axios.post).toHaveBeenCalledWith(
          "/api/author/v1/services",
          serviceSent
        );
        await waitFor(() => {
          expect(mockHistoryPush).toHaveBeenCalledTimes(1);
          expect(mockHistoryPush).toHaveBeenCalledWith({
            pathname: "/app/services",
            state: {
              updateMessage: "manageServices.saveMessage",
            },
          });
        });
      });

      it("handles existing ID error on clicking save button", async () => {
        axios.post.mockImplementationOnce(() =>
          Promise.reject(
            new CustomCodeErrorWithMessage(
              "SERVICE_NOT_UNIQUE: ID conflict",
              409
            )
          )
        );
        const ID = screen.getByRole("textbox", {
          name: "updateService.serviceKey.title",
        });
        const name = screen.getByRole("textbox", {
          name: "updateService.name.title",
        });
        const category = screen.getByRole("textbox", {
          name: "updateService.category.title",
        });
        const description = screen.getByRole("textbox", {
          name: "updateService.description.title",
        });
        const infoURL = screen.getByRole("textbox", {
          name: "updateService.infoURL.title",
        });

        userEvent.type(ID, "NEW_ID");
        userEvent.type(name, "new name");
        userEvent.type(category, "new category");
        userEvent.type(description, "new description");
        userEvent.type(infoURL, "https://www.url.com");

        const [saveButton] = screen.getAllByRole("button");
        expect(saveButton).toHaveTextContent("updateService.save");

        // Don't log the mocked axios error.
        jest.spyOn(console, "error").mockImplementationOnce(() => {});

        userEvent.click(saveButton);
        expect(axios.post).toHaveBeenCalledTimes(1);
        await waitFor(() => {
          const message = screen.getByRole("status");
          expect(message).toBeInTheDocument();
          expect(message).toHaveTextContent("httpError.duplicateID");
        });
      });

      it("handles existing ID error on clicking save button when backend does not return the right message", async () => {
        axios.post.mockImplementationOnce(() =>
          Promise.reject(
            new CustomCodeErrorWithMessage("missing code: ID conflict", 409)
          )
        );
        const ID = screen.getByRole("textbox", {
          name: "updateService.serviceKey.title",
        });
        const name = screen.getByRole("textbox", {
          name: "updateService.name.title",
        });
        const category = screen.getByRole("textbox", {
          name: "updateService.category.title",
        });
        const description = screen.getByRole("textbox", {
          name: "updateService.description.title",
        });
        const infoURL = screen.getByRole("textbox", {
          name: "updateService.infoURL.title",
        });

        userEvent.type(ID, "NEW_ID");
        userEvent.type(name, "new name");
        userEvent.type(category, "new category");
        userEvent.type(description, "new description");
        userEvent.type(infoURL, "https://www.url.com");

        const [saveButton] = screen.getAllByRole("button");
        expect(saveButton).toHaveTextContent("updateService.save");

        // Don't log the mocked axios error.
        jest.spyOn(console, "error").mockImplementationOnce(() => {});

        userEvent.click(saveButton);
        expect(axios.post).toHaveBeenCalledTimes(1);
        await waitFor(() => {
          const message = screen.getByRole("status");
          expect(message).toBeInTheDocument();
          expect(message).toHaveTextContent("httpError.duplicateID");
        });
      });

      it("handles improperly formatted ID error on clicking save button", async () => {
        const ID = screen.getByRole("textbox", {
          name: "updateService.serviceKey.title",
        });
        const name = screen.getByRole("textbox", {
          name: "updateService.name.title",
        });
        const category = screen.getByRole("textbox", {
          name: "updateService.category.title",
        });
        const description = screen.getByRole("textbox", {
          name: "updateService.description.title",
        });
        const infoURL = screen.getByRole("textbox", {
          name: "updateService.infoURL.title",
        });

        userEvent.type(ID, "invalidID");
        userEvent.type(name, "new name");
        userEvent.type(category, "new category");
        userEvent.type(description, "new description");
        userEvent.type(infoURL, "new url");

        const [saveButton] = screen.getAllByRole("button");
        expect(saveButton).toHaveTextContent("updateService.save");
        userEvent.click(saveButton);
        expect(axios.post).not.toHaveBeenCalled();

        const pageValidationError = screen.getByRole("status");
        const [keyValidationError] = screen.getAllByRole("alert");
        expect(pageValidationError).toHaveTextContent("validationError");
        expect(keyValidationError).toHaveTextContent(
          "updateService.serviceKey.error"
        );

        userEvent.click(pageValidationError.children[0]); // Click the 'X'.
        await waitFor(() => {
          const pageValidationError = screen.queryByRole("status");
          expect(pageValidationError).not.toBeInTheDocument();
        });
      });

      it("renders validation message on save with invalid fields", async () => {
        const [saveButton] = screen.getAllByRole("button");
        userEvent.click(saveButton);
        await waitFor(() => {
          const formMsg = screen.getByRole("status");
          const [
            idMsg,
            nameMsg,
            categoryMsg,
            descMsg,
            infoURLMsg,
          ] = screen.getAllByRole("alert");
          expect(formMsg).toBeInTheDocument();
          expect(formMsg).toHaveTextContent("validationError");
          expect(idMsg).toBeInTheDocument();
          expect(idMsg).toHaveTextContent("updateService.serviceKey.error");
          expect(nameMsg).toBeInTheDocument();
          expect(nameMsg).toHaveTextContent("missingFieldError");
          expect(categoryMsg).toBeInTheDocument();
          expect(categoryMsg).toHaveTextContent("missingFieldError");
          expect(descMsg).toBeInTheDocument();
          expect(descMsg).toHaveTextContent("missingFieldError");
          expect(infoURLMsg).toBeInTheDocument();
          expect(infoURLMsg).toHaveTextContent("updateService.infoURL.error");
        });
      });

      it("render validation message on save with invalid formula, URLs, and empty name", async () => {
        const ID = screen.getByRole("textbox", {
          name: "updateService.serviceKey.title",
        });
        const name = screen.getByRole("textbox", {
          name: "updateService.name.title",
        });
        const category = screen.getByRole("textbox", {
          name: "updateService.category.title",
        });
        const description = screen.getByRole("textbox", {
          name: "updateService.description.title",
        });
        const infoURL = screen.getByRole("textbox", {
          name: "updateService.infoURL.title",
        });
        const appURL = screen.getByRole("textbox", {
          name: "updateService.appURL.title",
        });
        const formulaInput = screen.getByRole("textbox", {
          name: "updateService.formula.title",
        });

        userEvent.type(ID, "NEW_ID");
        userEvent.type(name, "  ");
        userEvent.type(category, "new category");
        userEvent.type(description, "new description");
        userEvent.type(infoURL, "invalid url");
        userEvent.type(appURL, "invalid url");
        userEvent.type(formulaInput, "=DOES_NOT_EXIST");

        const [saveButton] = screen.getAllByRole("button");
        expect(saveButton).toHaveTextContent("updateService.save");
        userEvent.click(saveButton);
        await waitFor(() => {
          const formMsg = screen.getByRole("status");
          const [
            nameMsg,
            infoURLMsg,
            appURLMsg,
            formulaMsg,
          ] = screen.queryAllByRole("alert");
          expect(formMsg).toBeInTheDocument();
          expect(formMsg).toHaveTextContent("validationError");
          expect(nameMsg).toBeInTheDocument();
          expect(nameMsg).toHaveTextContent("missingField");
          expect(infoURLMsg).toBeInTheDocument();
          expect(infoURLMsg).toHaveTextContent("updateService.infoURL.error");
          expect(appURLMsg).toBeInTheDocument();
          expect(appURLMsg).toHaveTextContent("updateService.appURL.error");
          expect(formulaMsg).toBeInTheDocument();
          expect(formulaMsg).toHaveTextContent(
            "Errors detected! Unknown variable: 'DOES_NOT_EXIST'"
          );
        });
      });

      it("renders validate button and handles button being clicked with valid formula", async () => {
        const [, validateButton] = screen.getAllByRole("button");
        expect(validateButton).toHaveTextContent(
          "updateService.formula.validate"
        );
        const formulaInput = screen.getByRole("textbox", {
          name: "updateService.formula.title",
        });
        userEvent.type(formulaInput, "=IS_EMPLOYED");
        userEvent.click(validateButton);
        await waitFor(() => {
          const validationMsg = screen.queryByRole("alert");
          expect(validationMsg).toBeInTheDocument();
        });
      });

      it("handles validate button being clicked with invalid formula", async () => {
        const [, validateButton] = screen.getAllByRole("button");
        const formulaInput = screen.getByRole("textbox", {
          name: "updateService.formula.title",
        });
        userEvent.type(formulaInput, "=DOES_NOT_EXIST");
        expect(formulaInput).toHaveAttribute("name", "=DOES_NOT_EXIST");
        userEvent.click(validateButton);
        await waitFor(() => {
          const validationMsg = screen.queryByRole("alert");
          expect(validationMsg).toBeInTheDocument();
        });
      });

      it("renders the list of questions", async () => {
        const questionList = screen.getAllByLabelText(/questionlist-.*/);
        expect(questionList).toHaveLength(2);
      });

      it("makes an axios call to get the questions", async () => {
        await waitFor(() => {
          expect(axios.get).toHaveBeenCalledTimes(1);
          expect(axios.get).toHaveBeenCalledWith(
            "/api/author/v1/lookup/questions"
          );
        });
      });

      it("renders report card correctly", async () => {
        const name = screen.getByRole("textbox", {
          name: "updateService.name.title",
        });
        userEvent.type(name, "New service name");

        await waitFor(() => {
          const [, , cardHeader] = screen.getAllByRole("heading");
          expect(cardHeader).toHaveTextContent("New service name");
        });
      });

      it("has no a11y violations", async () => {
        expect(await axe(container)).toHaveNoViolations();
      });
    });

    describe("with unsuccessful axios calls", () => {
      beforeEach(async () => {
        // @ts-ignore
        axios.get.mockImplementation(() => {
          return Promise.reject(new Error("not found"));
        });

        const options = {
          routerOptions: {
            initialEntries: ["/app/services/create"],
          },
        };
        ({ container } = renderWith(<UpdateService isNew={true} />, options));

        screen.findAllByRole("heading");
      });

      afterEach(() => {
        jest.clearAllMocks();
      });

      it("displays generic error from failing to get questions", async () => {
        const header = screen.getByRole("heading");
        const content = screen.getByRole("region");

        expect(header).toHaveTextContent("httpError.title");
        expect(content).toHaveTextContent("httpError.generic");
      });
    });
  });
});
