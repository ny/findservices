import "@testing-library/jest-dom/extend-expect";
import { screen } from "@testing-library/react";
import React from "react";
import { renderWith, mockStore } from "maslow-shared/src/util/testing";
import { axe, toHaveNoViolations } from "jest-axe";
import { ServiceCard } from "features/services/components/ServiceCard";
import { sendServiceEvent } from "util/analytics";
import userEvent from "@testing-library/user-event";

expect.extend(toHaveNoViolations);

jest.mock("util/analytics");
jest.mock("react-i18next", () => {
  const realModule = jest.requireActual("react-i18next");

  // Mock return values just for i18n functions
  return {
    ...realModule,
    useTranslation: () => ({
      ...realModule.useTranslation(),
      i18n: {
        exists: (key) => {
          return key === "catalog:DOL_PUA.eligibility";
        },
        getResource: (lang, ns, key) => {
          if (key === "DOL_PUA.name") {
            return "Pandemic Unemployment Assistance";
          } else if (key === "DOL_UA.name") {
            return "Unemployment Assistance";
          } else {
            return "";
          }
        },
        getFixedT: (lang, ns) => {
          return jest.fn();
        },
      },
    }),
  };
});

describe("ServiceCard", () => {
  let container = null;
  let options = null;

  afterEach(() => jest.clearAllMocks());

  describe("when the service is not selected", () => {
    beforeEach(() => {
      const state = { report: {} };
      options = {
        state: state,
        store: mockStore(state),
      };
      ({ container } = renderWith(
        <ServiceCard serviceKey="DOL_PUA" />,
        options
      ));
    });

    it("renders with an accessible header", () => {
      const [header] = screen.getAllByRole("heading");
      expect(header).toHaveTextContent("DOL_PUA");
    });

    it("renders with category, description and expando", () => {
      expect(screen.getByText("DOL_PUA.category")).toBeInTheDocument();
      expect(screen.getByText("DOL_PUA.description")).toBeInTheDocument();
      expect(screen.getByText("DOL_PUA.eligibility")).toBeInTheDocument();
    });

    it("renders the 'Add To List' button", () => {
      const button = screen.getByRole("button");
      expect(button).toHaveTextContent(/services.actions.addToList/i);
    });

    it("has no a11y violations", async () => {
      expect(await axe(container)).toHaveNoViolations();
    });

    describe("and the 'Add to List' button is clicked", () => {
      beforeEach(() => {
        const button = screen.getByRole("button");
        userEvent.click(button);
      });

      it("toggles addedToReport", () => {
        const expected = [
          { type: "report/toggleAddedToReport", payload: "DOL_PUA" },
        ];
        const observed = options.store.getActions();
        expect(observed).toEqual(expected);
      });

      it("logs an Analytics event", () => {
        expect(sendServiceEvent).toHaveBeenCalledTimes(1);
        expect(sendServiceEvent).toHaveBeenCalledWith(
          "addToList",
          "Pandemic Unemployment Assistance"
        );
      });
    });
  });

  describe("when the service is selected", () => {
    beforeEach(() => {
      const state = { report: { DOL_UA: true } };
      options = {
        state: state,
        store: mockStore(state),
      };
      ({ container } = renderWith(
        <ServiceCard serviceKey="DOL_UA" />,
        options
      ));
    });

    it("renders with category, description and no expando", () => {
      expect(screen.getByText("DOL_UA.category")).toBeInTheDocument();
      expect(screen.getByText("DOL_UA.description")).toBeInTheDocument();
      expect(screen.queryByText("DOL_UA.eligibility")).not.toBeInTheDocument();
    });

    it("renders the 'Remove From List' button", () => {
      const button = screen.getByRole("button");
      expect(button).toHaveTextContent(/services.actions.removeFromList/i);
      expect(button).toHaveClass("active");
    });

    it("has no a11y violations", async () => {
      expect(await axe(container)).toHaveNoViolations();
    });

    describe("and the 'Remove from List' button is clicked", () => {
      beforeEach(() => {
        const button = screen.getByRole("button");
        userEvent.click(button);
      });

      it("toggles addedToReport", () => {
        const expected = [
          { type: "report/toggleAddedToReport", payload: "DOL_UA" },
        ];
        const observed = options.store.getActions();
        expect(observed).toEqual(expected);
      });

      it("logs an Analytics event", () => {
        expect(sendServiceEvent).toHaveBeenCalledTimes(1);
        expect(sendServiceEvent).toHaveBeenCalledWith(
          "removeFromList",
          "Unemployment Assistance"
        );
      });
    });
  });
});
