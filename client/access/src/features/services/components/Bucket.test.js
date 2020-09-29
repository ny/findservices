import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Bucket from "features/services/components/Bucket";
import { axe, toHaveNoViolations } from "jest-axe";
import { renderWith } from "maslow-shared/src/util/testing";
import React from "react";

expect.extend(toHaveNoViolations);

describe("A Bucket", () => {
  let container = null;

  describe("when not collapsible", () => {
    beforeEach(() => {
      const options = {
        state: {
          report: {},
        },
      };
      ({ container } = renderWith(
        <Bucket
          title="services.recommended.title"
          serviceKeys={["DOL_PUA", "DOL_UA", "SNAP"]}
        />,
        options
      ));
    });

    it("renders headings", async () => {
      const [heading1, heading2, heading3, heading4] = screen.getAllByRole(
        "heading"
      );
      expect(heading1).toHaveTextContent("services.recommended.title");
      expect(heading2).toHaveTextContent("DOL_PUA.name");
      expect(heading3).toHaveTextContent("DOL_UA.name");
      expect(heading4).toHaveTextContent("SNAP.name");
    });

    it("renders 3 buttons, one for each service card", async () => {
      const [buttonOne, buttonTwo, buttonThree] = screen.getAllByRole("button");
      expect(buttonOne).toBeInTheDocument();
      expect(buttonTwo).toBeInTheDocument();
      expect(buttonThree).toBeInTheDocument();
    });

    it("has no a11y violations", async () => {
      expect(await axe(container)).toHaveNoViolations();
    });

    it("supports tab navigation", () => {
      // Tab navigation cycles from body -> through services -> to body
      expect(document.body).toHaveFocus();
      userEvent.tab(); // onto first service
      const [button1, button2, button3] = screen.getAllByRole("button");
      expect(button1).toHaveFocus();
      userEvent.tab(); // onto second service
      expect(button2).toHaveFocus();
      userEvent.tab(); // onto third service
      expect(button3).toHaveFocus();
      userEvent.tab(); // onto body
      expect(document.body).toHaveFocus();
    });
  });

  describe("when collapsible and in a collapsed state", () => {
    beforeEach(() => {
      const options = {
        state: {
          report: {},
        },
      };
      ({ container } = renderWith(
        <Bucket
          title="services.recommended.title"
          additionalText="additional.text"
          serviceKeys={["DOL_PUA", "DOL_UA", "SNAP"]}
          collapsible={true}
        />,
        options
      ));
    });

    it("displays a header and additional text", () => {
      const heading = screen.getByRole("heading");
      const text = screen.getByText("additional.text");

      expect(heading).toHaveTextContent("services.recommended.title");
      expect(text).toBeInTheDocument();
    });

    it("displays a button that expands the service list when clicked", () => {
      const button = screen.getByRole("button");

      let serviceName = screen.queryByRole("heading", { name: "DOL_PUA.name" });
      expect(serviceName).not.toBeInTheDocument();

      userEvent.click(button);

      const [, DOL_PUA] = screen.getAllByRole("heading");
      expect(DOL_PUA).toHaveTextContent("DOL_PUA.name");
    });

    it("has no a11y violations", async () => {
      expect(await axe(container)).toHaveNoViolations();
    });

    it("supports tab navigation", () => {
      // Tab navigation cycles from body -> to toggle button -> to body
      expect(document.body).toHaveFocus();
      userEvent.tab(); // onto button
      const button = screen.getByRole("button");
      expect(button).toHaveFocus();
      userEvent.tab(); // onto body
      expect(document.body).toHaveFocus();
    });
  });

  describe("when collapsible and in an expanded state", () => {
    beforeEach(() => {
      const options = {
        state: {
          report: {},
        },
      };
      ({ container } = renderWith(
        <Bucket
          title="services.recommended.title"
          additionalText="additional.text"
          serviceKeys={["DOL_PUA", "DOL_UA", "SNAP"]}
          collapsible={true}
        />,
        options
      ));

      // Show the collapsed services
      userEvent.click(screen.getByRole("button"));
    });

    it("displays a header and additional text", () => {
      const [heading] = screen.getAllByRole("heading");
      const text = screen.getByText("additional.text");

      expect(heading).toHaveTextContent("services.recommended.title");
      expect(text).toBeInTheDocument();
    });

    it("displays a button that collapses the service list when clicked", () => {
      // Confirm all services currently displayed
      let headings = screen.getAllByRole("heading");
      expect(headings).toHaveLength(4); // bucket heading + 3 service cards
      expect(headings[1]).toHaveTextContent("DOL_PUA.name");
      expect(headings[2]).toHaveTextContent("DOL_UA.name");
      expect(headings[3]).toHaveTextContent("SNAP.name");

      // Hide services
      const [button] = screen.getAllByRole("button");
      userEvent.click(button);

      // Confirm all services hidden
      headings = screen.getAllByRole("heading");
      expect(headings).toHaveLength(1);
      expect(headings[0]).toHaveTextContent("services.recommended.title");
    });

    it("has no a11y violations", async () => {
      expect(await axe(container)).toHaveNoViolations();
    });

    it("supports tab navigation", () => {
      // Tab navigation cycles from toggle button -> through services ->
      // -> to body -> back to toggle button
      const [toggleButton, button1, button2, button3] = screen.getAllByRole(
        "button"
      );
      expect(toggleButton).toHaveFocus();
      userEvent.tab(); // onto first service
      expect(button1).toHaveFocus();
      userEvent.tab(); // onto second service
      expect(button2).toHaveFocus();
      userEvent.tab(); // onto third service
      expect(button3).toHaveFocus();
      userEvent.tab(); // onto body
      expect(document.body).toHaveFocus();
      userEvent.tab(); // onto button
      expect(toggleButton).toHaveFocus();
    });
  });
});
