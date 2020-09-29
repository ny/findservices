import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Services from "features/services/components/Services";
import { axe, toHaveNoViolations } from "jest-axe";
import { renderWith } from "maslow-shared/src/util/testing";
import React from "react";
import { sendPageViewEvent } from "util/analytics";

jest.mock("util/analytics");

expect.extend(toHaveNoViolations);

describe("Services", () => {
  let container = null;

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("with matching services", () => {
    beforeEach(() => {
      const mockState = {
        serviceData: {
          rank: ["DOL_UA", "EAA"],
          services: {
            DOL_UA: {
              formula: "=NOT(IS_EMPLOYED)",
            },
            EAA: { formula: "" },
          },
        },
        report: {},
        responses: {
          IS_EMPLOYED: false,
        },
      };
      const options = {
        state: mockState,
      };
      ({ container } = renderWith(<Services />, options));
    });

    it("renders ranked services, additional services, view all, and select services", async () => {
      const [heading1, heading2, heading3, heading4] = screen.getAllByRole(
        "heading"
      );
      expect(heading1).toHaveTextContent("services.recommended.title");
      expect(heading2).toHaveTextContent("DOL_UA.name");
      expect(heading3).toHaveTextContent("services.additional.title");
      expect(screen.getByText("services.additional.label")).toBeInTheDocument();
      expect(heading4).toHaveTextContent("services.everything.title");
      expect(
        screen.getByText("services.everything.instructions")
      ).toBeInTheDocument();

      // Click "add to list" so that the selected services section shows up.
      const [button1] = screen.getAllByRole("button", {
        name: "services.actions.addToList",
      });
      userEvent.click(button1);
      const selectServices = screen.getByRole("status");
      expect(selectServices).toBeInTheDocument();
    });

    it("has no a11y violations", async () => {
      expect(await axe(container)).toHaveNoViolations();
    });

    it("supports tab navigation", () => {
      // Tab navigation cycles from body -> through services -> to body
      expect(document.body).toHaveFocus();
      userEvent.tab(); // onto first service
      const [addToList, expandMoreServices] = screen.getAllByRole("button");
      expect(addToList).toHaveFocus();
      userEvent.tab(); // onto Bucket button
      expect(expandMoreServices).toHaveFocus();
      userEvent.tab(); // onto body
      expect(document.body).toHaveFocus();
    });

    it("registers a page view with Google Analytics", async () => {
      expect(sendPageViewEvent).toHaveBeenCalledWith(
        "/services-selection",
        "Services Selection"
      );
      expect(sendPageViewEvent).toHaveBeenCalledTimes(1);
    });
  });

  describe("with no matching services", () => {
    beforeEach(() => {
      const initialState = {
        report: {},
        serviceData: {
          rank: ["DOL_UA"],
          services: { DOL_UA: { formula: "" } },
        },
      };
      const options = {
        state: initialState,
      };
      ({ container } = renderWith(<Services />, options));
    });

    it("renders additional services, view all, and select services", async () => {
      const [heading1, heading2, heading3] = screen.getAllByRole("heading");
      expect(heading1).toHaveTextContent("services.default.title");
      expect(screen.getByText("services.default.label")).toBeInTheDocument();
      expect(heading2).toHaveTextContent("DOL_UA");
      expect(heading3).toHaveTextContent("services.everything.title");
      expect(
        screen.getByText("services.everything.instructions")
      ).toBeInTheDocument();

      // Click "add to list" so that the selected services section shows up.
      const addToList = screen.getByRole("button", {
        name: "services.actions.addToList",
      });
      userEvent.click(addToList);
      const selectServices = screen.getByRole("status");
      expect(selectServices).toBeInTheDocument();
    });

    it("has no a11y violations", async () => {
      expect(await axe(container)).toHaveNoViolations();
    });

    it("registers a page view with Google Analytics", async () => {
      expect(sendPageViewEvent).toHaveBeenCalledWith(
        "/services-selection",
        "Services Selection"
      );
      expect(sendPageViewEvent).toHaveBeenCalledTimes(1);
    });
  });

  describe("with no matching or additional services", () => {
    beforeEach(() => {
      const initialState = {
        report: {},
        serviceData: {
          rank: [],
          services: {},
        },
      };
      const options = {
        state: initialState,
      };
      ({ container } = renderWith(<Services />, options));
    });

    it("only displays the View All Services section", () => {
      const heading = screen.getByRole("heading");
      const content = screen.getByText("services.everything.instructions");

      expect(heading).toHaveTextContent("services.everything.title");
      expect(content).toBeInTheDocument();

      const selectServices = screen.queryByRole("status");
      const defaultTitle = screen.queryByRole("heading", {
        name: "services.default.title",
      });
      const recommendedTitle = screen.queryByRole("heading", {
        name: "services.recommended.title",
      });
      const additionalTitle = screen.queryByRole("heading", {
        name: "services.additional.title",
      });

      expect(selectServices).not.toBeInTheDocument();
      expect(defaultTitle).not.toBeInTheDocument();
      expect(recommendedTitle).not.toBeInTheDocument();
      expect(additionalTitle).not.toBeInTheDocument();
    });

    it("has no a11y violations", async () => {
      expect(await axe(container)).toHaveNoViolations();
    });
    it("registers a page view with Google Analytics", async () => {
      expect(sendPageViewEvent).toHaveBeenCalledWith(
        "/services-selection",
        "Services Selection"
      );
      expect(sendPageViewEvent).toHaveBeenCalledTimes(1);
    });
  });
});
