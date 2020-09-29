import { screen } from "@testing-library/react";
import PrintReport from "features/report/components/PrintReport";
import { axe, toHaveNoViolations } from "jest-axe";
import React from "react";
import { renderWith } from "maslow-shared/src/util/testing";

expect.extend(toHaveNoViolations);

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useLocation: () => ({
    // Simulate the user having selected these three services
    search: "?services=DOL_PUA,SNAP,DOL_UA",
  }),
}));

describe("print report", () => {
  let container;

  beforeEach(() => {
    // The PrintReport page requires services data, fetched from the server API.
    // Provide a sample of that data, including links that will be turned into
    // footnotes.
    const options = {
      state: {
        serviceData: {
          services: {
            DOL_PUA: {
              informationUrl: "infoURL",
              applicationUrl: "appURL",
            },
            SNAP: {
              informationUrl: "infoURL2",
            },
            DOL_UA: {
              informationUrl: "infoURL3",
              applicationUrl: "appURL2",
            },
          },
        },
      },
    };

    ({ container } = renderWith(<PrintReport />, options));
  });

  it("displays the main header", () => {
    const [mainHeader, ,] = screen.getAllByRole("heading");
    expect(mainHeader).toHaveTextContent("report.title");
  });

  it("displays the chosen services", () => {
    // The first heading is the page heading, not a service heading.
    const [, PUAHeader, SNAPHeader, UAHeader] = screen.getAllByRole("heading");
    expect(PUAHeader).toHaveTextContent("DOL_PUA.name");
    expect(SNAPHeader).toHaveTextContent("SNAP.name");
    expect(UAHeader).toHaveTextContent("DOL_UA.name");
  });

  it("displays the correct footnotes", () => {
    const [infoURL, appURL, infoURL2, infoURL3, appURL2] = screen.getAllByRole(
      "listitem"
    );
    expect(infoURL).toHaveTextContent("infoURL");
    expect(appURL).toHaveTextContent("appURL");
    expect(infoURL2).toHaveTextContent("infoURL2");
    expect(infoURL3).toHaveTextContent("infoURL3");
    expect(appURL2).toHaveTextContent("appURL2");
  });

  it("has no axe violations", async () => {
    expect(await axe(container)).toHaveNoViolations();
  });
});
