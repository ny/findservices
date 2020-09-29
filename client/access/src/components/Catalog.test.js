/* eslint-disable i18next/no-literal-string */
import { screen, waitFor } from "@testing-library/react";
import { i18nStates } from "app/globalFlagsSlice";
import axios from "axios";
import Catalog from "components/Catalog";
import { mockStore, renderWith } from "maslow-shared/src/util/testing";
import React from "react";

jest.mock("axios");

describe("The catalog", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("while loading", () => {
    beforeEach(() => {
      // @ts-ignore
      axios.get.mockResolvedValue({ data: {} });
      const options = {
        state: { flags: { i18nState: i18nStates.NOT_INITIALIZED } },
      };

      const node = (
        <Catalog>
          <button />
        </Catalog>
      );
      renderWith(node, options);
    });

    it("starts to fetch the catalog from the server", () => {
      expect(axios.get).toHaveBeenCalledWith("/api/explore/v1/catalog");
    });

    it("renders an empty div while waiting", () => {
      const empty = screen.queryByTestId("empty");
      expect(empty).toBeInTheDocument();
    });
  });

  describe("when it loads successfully", () => {
    let options;

    beforeEach(() => {
      // @ts-ignore
      axios.get.mockResolvedValue({ data: {} });
      options = {
        store: mockStore({
          flags: { i18nState: i18nStates.INITIALIZED },
          survey: [{ FAKE_SECTION: [] }],
        }),
      };

      const node = (
        <Catalog>
          <button />
        </Catalog>
      );
      renderWith(node, options);
    });

    it("fetches the catalog from the server", () => {
      expect(axios.get).toHaveBeenCalledWith("/api/explore/v1/catalog");
    });

    it("updates the store", async () => {
      const observed = options.store.getActions();
      const expected = [
        { type: "serviceData/updateServices", payload: {} },
        { type: "questions/updateQuestions", payload: {} },
        { type: "survey/updateSurvey", payload: {} },
      ];
      expect(observed).toEqual(expected);
    });

    it("renders the provided content", async () => {
      const button = screen.queryByRole("button");
      expect(button).toBeInTheDocument();
    });
  });

  describe("when it fails to load", () => {
    it("renders the generic error page", async () => {
      // Mock initial application state & data fetch from server.
      const mockError = new Error("Async Error");
      // @ts-ignore
      axios.get.mockRejectedValue(mockError);
      const mockConsole = jest
        .spyOn(console, "error")
        .mockImplementationOnce(() => {});

      const options = {
        state: { flags: { i18nState: i18nStates.INITIALIZED } },
      };

      // Render the Catalog with a child that should never show up.
      const node = (
        <Catalog>
          <h1>Child content</h1>
        </Catalog>
      );
      renderWith(node, options);

      // Await completion of async call before remaining assertions
      await waitFor(() =>
        expect(axios.get).toHaveBeenCalledWith("/api/explore/v1/catalog")
      );

      expect(mockConsole).toHaveBeenCalledWith(
        expect.stringContaining("Failed to load"),
        mockError
      );
      const heading = screen.getByRole("heading");
      expect(heading).toHaveTextContent("survey.error.title");
    });
  });

  describe("when translations fail to load", () => {
    it("renders the generic error page", async () => {
      const options = {
        state: {
          flags: { i18nState: i18nStates.FAILED },
          survey: [{ FAKE_SECTION: [] }],
        },
      };

      // @ts-ignore
      axios.get.mockResolvedValue({ data: {} });

      const node = (
        <Catalog>
          <h1>Child content</h1>
        </Catalog>
      );
      renderWith(node, options);

      const heading = screen.getByRole("heading");
      expect(heading).toHaveTextContent("survey.error.title");
    });
  });
});
