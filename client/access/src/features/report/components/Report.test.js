// @ts-nocheck
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Report from "features/report/components/Report";
import { axe, toHaveNoViolations } from "jest-axe";
import { renderWith } from "maslow-shared/src/util/testing";
import React from "react";
import { sendEvent, sendPageViewEvent } from "util/analytics";

expect.extend(toHaveNoViolations);

jest.mock("util/analytics");
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useLocation: () => ({
    // Simulate the user having selected these two services
    search: "?services=DOL_PUA,SNAP",
  }),
}));

describe("Report", () => {
  describe("when all chosen services are no longer available", () => {
    it("prompts the user to re-take the survey", () => {
      // With no state passed in when rendering, both services are unavailable.
      renderWith(<Report />);

      const heading = screen.getByRole("heading");
      const content = screen.getByRole("region");
      const startOver = screen.getByRole("link");

      expect(heading).toHaveTextContent("report.error.title");
      expect(content).toHaveTextContent("report.error.instructions");
      expect(startOver).toHaveAttribute("href", "/app/survey");
    });
  });

  describe("when some chosen services are no longer available", () => {
    beforeEach(() => {
      // Simulate only one of the two services being retrieved from the server
      const options = {
        state: {
          serviceData: {
            services: {
              DOL_PUA: {
                description: "",
                title: "",
                category: "",
              },
            },
            rank: ["DOL_PUA"],
          },
        },
      };

      renderWith(<Report />, options);
    });

    it("informs the user that some services have been removed", () => {
      const warning = screen.getByRole("alert");
      expect(warning).toHaveTextContent("report.message.servicesRemoved");
    });

    it("displays services that are still available", () => {
      const [, remainingService] = screen.getAllByRole("heading");
      expect(remainingService).toHaveTextContent("DOL_PUA.name");
    });
  });

  describe("with selected services", () => {
    let container;
    const url = "http://localhost/app/list?services=DOL_PUA,SNAP";

    // The Report page requires services data, fetched from the server API.
    // Provide a sample of that data.

    const services = {
      DOL_PUA: {
        description: "",
        title: "",
        category: "",
        eligibility: "",
      },
      SNAP: {
        description: "",
        title: "",
        category: "",
        eligibility: "SNAP eligibility",
        preparation: "SNAP preparation",
        instructions: "SNAP instructions",
      },
    };

    describe("when services are not selected in rank order", () => {
      it("displays the services in ranked order", () => {
        const options = {
          state: {
            serviceData: {
              services: services,
              // Reverse order from the URL parameter
              rank: ["SNAP", "DOL_PUA"],
            },
          },
        };
        renderWith(<Report />, options);

        const [, SNAPHeader, PUAHeader] = screen.getAllByRole("heading");
        expect(SNAPHeader).toHaveTextContent("SNAP.name");
        expect(PUAHeader).toHaveTextContent("DOL_PUA.name");
      });
    });

    describe("on a browser that does not support sharing", () => {
      beforeEach(() => {
        delete window.location;
        // Mock assign function to verify the parameters passed to it.
        window.location = {
          href: url,
          assign: jest.fn(),
        };

        const options = {
          state: {
            serviceData: {
              services: services,
              rank: ["DOL_PUA", "SNAP"],
            },
          },
        };

        ({ container } = renderWith(<Report />, options));
      });

      afterEach(() => {
        jest.clearAllMocks();
      });

      it("displays the main header", () => {
        const [mainHeader] = screen.getAllByRole("heading");
        expect(mainHeader).toHaveTextContent("report.title");
      });

      it("displays the correct buttons", () => {
        const [emailButton, printButton] = screen.getAllByRole("button");
        expect(emailButton).toHaveTextContent("report.actions.email");
        expect(printButton).toHaveTextContent("report.actions.print");
      });

      it("displays the chosen services", () => {
        // The first heading is the page heading, not a service heading.
        const [, PUAHeader, SNAPHeader] = screen.getAllByRole("heading");
        expect(PUAHeader).toHaveTextContent("DOL_PUA.name");
        expect(SNAPHeader).toHaveTextContent("SNAP.name");
        const PUAcategory = screen.queryByText("DOL_PUA.category");
        expect(PUAcategory).toBeInTheDocument();
        // Fields with missing values should not be displayed.
        const PUAeligibility = screen.queryByText("DOL_PUA.eligibility");
        expect(PUAeligibility).not.toBeInTheDocument();
      });

      it("displays all non-empty fields of chosen services", () => {
        // The first heading is the page heading, not a service heading.
        const [, PUAHeader, SNAPHeader] = screen.getAllByRole("heading");
        expect(PUAHeader).toHaveTextContent("DOL_PUA.name");
        expect(SNAPHeader).toHaveTextContent("SNAP.name");
        const SNAPcategory = screen.queryByText("SNAP.category");
        expect(SNAPcategory).toBeInTheDocument();
        // All fields should be displayed.
        const SNAPeligibility = screen.queryByText("report.apply.criteria");
        expect(SNAPeligibility).toBeInTheDocument();
        const SNAPinstructions = screen.queryByText("report.apply.ready");
        expect(SNAPinstructions).toBeInTheDocument();
        const SNAPpreparation = screen.queryByText("report.apply.need");
        expect(SNAPpreparation).toBeInTheDocument();
      });

      it("registers a page view with Google Analytics", () => {
        expect(sendPageViewEvent).toHaveBeenCalledWith(
          "/services-list",
          "Services List"
        );
        expect(sendPageViewEvent).toHaveBeenCalledTimes(1);
      });

      it("supports emailing services URL", () => {
        const [emailButton] = screen.getAllByRole("button");
        userEvent.click(emailButton);
        expect(window.location.assign).toHaveBeenCalledWith(
          "mailto:?subject=report.share.subject&body=report.share.body"
        );
        expect(sendEvent).toHaveBeenCalledWith("email");
        expect(sendEvent).toHaveBeenCalledTimes(1);
      });

      it("supports printing services", () => {
        const [, printButton] = screen.getAllByRole("button");
        userEvent.click(printButton);
        expect(sendEvent).toHaveBeenCalledWith("print");
        expect(sendEvent).toHaveBeenCalledTimes(1);
      });

      it("has no axe violations", async () => {
        expect(await axe(container)).toHaveNoViolations();
      });
    });

    describe("on a browser that supports sharing", () => {
      beforeEach(() => {
        // Mock the navigator.share function so that the parameters passed to it
        // can be verified.
        const mockShare = jest
          .fn()
          .mockImplementationOnce((data) => Promise.resolve());
        navigator.share = mockShare;

        const options = {
          state: {
            serviceData: {
              services: services,
              rank: ["DOL_PUA", "SNAP"],
            },
          },
        };

        ({ container } = renderWith(<Report />, options));
      });

      afterEach(() => {
        jest.clearAllMocks();
      });

      it("displays the main header", () => {
        const [mainHeader, ,] = screen.getAllByRole("heading");
        expect(mainHeader).toHaveTextContent("report.title");
      });

      it("displays the correct buttons", () => {
        const [shareButton, printButton] = screen.getAllByRole("button");
        expect(shareButton).toHaveTextContent("report.actions.share");
        expect(printButton).toHaveTextContent("report.actions.print");
      });

      it("supports sharing services URL", async () => {
        const [shareButton] = screen.getAllByRole("button");
        userEvent.click(shareButton);
        await expect(navigator.share).toHaveBeenCalledWith({
          title: "report.share.subject",
          text: "report.share.text",
          url: url,
        });
        expect(sendEvent).toHaveBeenCalledWith("share");
        expect(sendEvent).toHaveBeenCalledTimes(1);
      });

      it("supports printing services", () => {
        const [, printButton] = screen.getAllByRole("button");
        userEvent.click(printButton);
        expect(sendEvent).toHaveBeenCalledWith("print");
        expect(sendEvent).toHaveBeenCalledTimes(1);
      });

      it("has no axe violations", async () => {
        expect(await axe(container)).toHaveNoViolations();
      });
    });
  });
});
