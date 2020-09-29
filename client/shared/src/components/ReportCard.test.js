import "@testing-library/jest-dom/extend-expect";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import React from "react";
import { renderWith } from "../util/testing";
import { ReportCard } from "./ReportCard";

expect.extend(toHaveNoViolations);

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

describe("ReportCard", () => {
  let container = null;

  const mockServiceData = {
    services: {
      DOL_PUA: {
        applicationUrl: "https://unemployment.labor.ny.gov/",
        informationUrl: "https://unemployment.labor.ny.gov/",
        preparation: "Bring passport",
        instructions: "Apply on MyBenefits",
        eligibility: "Must be unemployed",
        name: "Pandemic Unemployment Assistance",
        category: "Health",
        description: "Description",
      },
      STEM: {
        applicationUrl: "https://stem",
        informationUrl: "https://steminfo",
        name: "STEM",
        category: "Education",
        description: "Description",
      },
    },
  };

  afterEach(jest.clearAllMocks);

  describe("for a service with all fields", () => {
    beforeEach(() => {
      ({ container } = renderWith(
        <ReportCard service={mockServiceData.services.DOL_PUA} />
      ));
    });

    it("renders a header", () => {
      const header = screen.getByRole("heading");
      expect(header).toHaveTextContent("Pandemic Unemployment Assistance");
    });

    it("renders sections", () => {
      const category = screen.queryByText("Health");
      expect(category).toBeInTheDocument();
      const [learnMoreLink, applyLink] = screen.getAllByRole("link");
      expect(learnMoreLink).toHaveTextContent("report.learnMore");
      expect(applyLink).toHaveTextContent("report.apply.howTo");
      const readyToApply = screen.queryByText("report.apply.ready");
      expect(readyToApply).toBeInTheDocument();
      const needToApply = screen.queryByText("report.apply.need");
      expect(needToApply).toBeInTheDocument();
      const additionalCriteria = screen.queryByText("report.apply.criteria");
      expect(additionalCriteria).toBeInTheDocument();
    });

    it("has no a11y violations", async () => {
      expect(await axe(container)).toHaveNoViolations();
    });
  });

  describe("for a service without preparation or instruction fields", () => {
    beforeEach(() => {
      ({ container } = renderWith(
        <ReportCard service={mockServiceData.services.STEM} />
      ));
    });

    it("renders a header", () => {
      const header = screen.getByRole("heading");
      expect(header).toHaveTextContent("STEM");
    });

    it("renders only 'learn more' and 'how to apply' sections'", () => {
      const [learnMoreLink, applyLink] = screen.getAllByRole("link");
      expect(learnMoreLink).toHaveTextContent("report.learnMore");
      expect(applyLink).toHaveTextContent("report.apply.howTo");
      const readyToApply = screen.queryByText("report.apply.ready");
      expect(readyToApply).not.toBeInTheDocument();
      const needToApply = screen.queryByText("report.apply.need");
      expect(needToApply).not.toBeInTheDocument();
      const additionalCriteria = screen.queryByText("report.apply.criteria");
      expect(additionalCriteria).not.toBeInTheDocument();
    });

    it("has no a11y violations", async () => {
      expect(await axe(container)).toHaveNoViolations();
    });
  });

  describe("for services passed a callback for the learn more link", () => {
    it("fires the callback when the link is clicked", () => {
      const callback = jest.fn();
      renderWith(
        <ReportCard
          service={mockServiceData.services.STEM}
          learnMoreOnClick={callback}
        />
      );

      const learnMoreLink = screen.getByRole("link", {
        name: "report.learnMore",
      });
      expect(callback).not.toHaveBeenCalled();
      userEvent.click(learnMoreLink);
      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  describe("when a specific language is provided", () => {
    it("translates strings into that language", () => {
      renderWith(
        <ReportCard service={mockServiceData.services.STEM} lng="es" />
      );

      expect(mockT).toHaveBeenCalledWith("es");
    });
  });
});
