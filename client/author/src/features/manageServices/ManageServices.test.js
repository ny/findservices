import "@testing-library/jest-dom/extend-expect";
import React from "react";
import { renderWith } from "maslow-shared/src/util/testing";
import { axe, toHaveNoViolations } from "jest-axe";
import axios from "axios";
import ManageServices from "features/manageServices/ManageServices";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

jest.mock("@okta/okta-react", () => ({
  useOktaAuth: () => ({
    authState: { isAuthenticated: true },
    authService: { handleAuthentication: jest.fn() },
  }),
}));
jest.mock("axios");
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useLocation: () => ({
    state: { updateMessage: "Your changes have been saved" },
  }),
}));

expect.extend(toHaveNoViolations);

describe.skip("ManageServices", () => {
  let container = null;

  describe.skip("with successful axios calls", () => {
    beforeEach(() => {
      // @ts-ignore
      axios.get.mockResolvedValue({
        data: {
          services: {
            DOL_UA: {
              rank: 1,
              modified: "2020-01-01T10:00:00.000Z",
              enabled: true,
              resources: {
                en: {
                  name: "Unemployment Assistance",
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
            },
            DOL_PUA: {
              rank: 3,
              modified: "2020-01-01T10:00:00.000Z",
              enabled: false,
              resources: {
                en: {
                  name: "Pandemic Unemployment Assistance",
                },
              },
              resourceVersions: {
                bn: "hash",
                en: "hash",
                es: "hash",
                ht: "hash",
              },
            },
            SNAP: {
              rank: 2,
              modified: "2020-01-01T10:00:00.000Z",
              enabled: false,
              resources: {
                en: {
                  name: "SNAP",
                },
              },
              resourceVersions: {
                bn: "hash",
                en: "hash",
                es: "differenthash",
                ht: "hash",
                ko: "hash",
                ru: "hash",
                zh: "hash",
              },
            },
          },
        },
      });
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    describe.skip("without message", () => {
      beforeEach(async () => {
        ({ container } = renderWith(<ManageServices />));
        await waitFor(() =>
          screen.getByRole("heading", { name: "manageServices.title" })
        );
      });

      it("renders with an accessible header", async () => {
        const [header] = screen.getAllByRole("heading");
        expect(header).toHaveTextContent("manageServices.title");
      });

      it("renders with an Add Service button", async () => {
        const [button] = screen.getAllByRole("button");
        expect(button).toHaveTextContent("manageServices.addService");
      });

      it("renders the table column headers", async () => {
        const headers = screen.getAllByRole("columnheader");
        expect(headers).toHaveLength(6);
        expect(headers[0]).toHaveTextContent("manageServices.rank");
        expect(headers[1]).toHaveTextContent("manageServices.name");
        expect(headers[2]).toHaveTextContent("manageServices.modified");
        expect(headers[3]).toHaveTextContent("manageServices.visibility");
        expect(headers[4]).toHaveTextContent("manageServices.translations");
      });

      it("renders the rows in ranked order", async () => {
        // Check all cells in the first row besides the first one, which includes
        // buttons that are checked elsewhere. In the second and third rows, just
        // check cells that include logic which needs checking.
        const [
          ,
          name1,
          modified1,
          visibility1,
          translation1,
          ,
          ,
          name2,
          ,
          visibility2,
          translation2,
          ,
          ,
          name3,
          ,
          ,
          translation3,
          ,
        ] = screen.getAllByRole("cell");
        expect(name1).toHaveTextContent("Unemployment Assistance");
        expect(name2).toHaveTextContent("SNAP");
        expect(name3).toHaveTextContent("Pandemic Unemployment Assistance");
        expect(modified1).toHaveTextContent("Jan 1st, 2020");
        expect(visibility1).toHaveTextContent("manageServices.visible");
        expect(visibility2).toHaveTextContent("manageServices.hidden");
        expect(translation1).toHaveTextContent("manageServices.translated");
        expect(translation2).toHaveTextContent("manageServices.outdated");
        expect(translation3).toHaveTextContent("manageServices.notTranslated");
      });

      it("renders the correct buttons", async () => {
        const [
          addService,
          moveToTop1,
          moveUp1,
          moveDown1,
          moveToBottom1,
          moveToTop2,
          moveUp2,
          moveDown2,
          moveToBottom2,
          moveToTop3,
          moveUp3,
          moveDown3,
          moveToBottom3,
        ] = screen.getAllByRole("button");
        expect(addService).toBeDefined();
        expect(moveToTop1).toBeDefined();
        expect(moveToTop1).toHaveAttribute("disabled");
        expect(moveUp1).toBeDefined();
        expect(moveUp1).toHaveAttribute("disabled");
        expect(moveDown1).toBeDefined();
        expect(moveToBottom1).toBeDefined();
        expect(moveToTop2).toBeDefined();
        expect(moveUp2).toBeDefined();
        expect(moveDown2).toBeDefined();
        expect(moveToBottom2).toBeDefined();
        expect(moveToTop3).toBeDefined();
        expect(moveUp3).toBeDefined();
        expect(moveDown3).toBeDefined();
        expect(moveDown3).toHaveAttribute("disabled");
        expect(moveToBottom3).toBeDefined();
        expect(moveToBottom3).toHaveAttribute("disabled");
      });

      it("renders the correct edit links", async () => {
        const [addService, edit1, edit2, edit3] = screen.getAllByRole("link");
        expect(addService).toBeDefined();
        const link1 = edit1.getAttribute("href");
        expect(link1).toBe("/app/services/update/DOL_UA");
        expect(edit2).toBeDefined();
        const link2 = edit2.getAttribute("href");
        expect(link2).toBe("/app/services/update/SNAP");
        expect(edit3).toBeDefined();
        const link3 = edit3.getAttribute("href");
        expect(link3).toBe("/app/services/update/DOL_PUA");
      });

      it("renders message", async () => {
        const updateMessage = screen.getByRole("status");
        expect(updateMessage).toHaveTextContent("Your changes have been saved");
      });

      it("dismisses message", async () => {
        const updateMessage = screen.getByRole("status");
        userEvent.click(updateMessage.children[0]); // Click the 'X'.
        await waitFor(() => {
          const updateMessage = screen.queryByRole("status");
          expect(updateMessage).not.toBeInTheDocument();
        });
      });

      it("makes an axios call to get the services", async () => {
        await waitFor(() => {
          expect(axios.get).toHaveBeenCalledTimes(1);
          expect(axios.get).toHaveBeenCalledWith("/api/author/v1/services");
        });
      });

      it("makes axios calls to update ranking and get new services when buttons are clicked", async () => {
        axios.post.mockResolvedValue({ data: { services: {} } });

        const buttons = screen.getAllByRole("button");
        userEvent.click(buttons[3]); // lower ranking of first service

        await waitFor(() => {
          expect(axios.post).toHaveBeenCalledTimes(1);
          expect(axios.post).toHaveBeenCalledWith(
            "/api/author/v1/services:rank",
            [
              { key: "DOL_UA", rank: 2 },
              { key: "SNAP", rank: 1 },
            ]
          );
          expect(axios.get).toHaveBeenCalledTimes(2);
        });
      });

      it("makes axios calls to move to top and get new services when buttons are clicked", async () => {
        axios.post.mockResolvedValue({ data: { services: {} } });

        const buttons = screen.getAllByRole("button");
        userEvent.click(buttons[9]); // move to top of last service

        await waitFor(() => {
          expect(axios.post).toHaveBeenCalledTimes(1);
          expect(
            axios.post
          ).toHaveBeenCalledWith("/api/author/v1/services:rank", [
            { key: "DOL_PUA", rank: 0 },
          ]);
          expect(axios.get).toHaveBeenCalledTimes(2);
        });
      });

      it("has no a11y violations", async () => {
        expect(await axe(container)).toHaveNoViolations();
      });
    });
  });

  describe.skip("with failed axios call", () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    beforeEach(async () => {
      // @ts-ignore
      axios.get.mockImplementationOnce(() =>
        Promise.reject(new Error("network failure"))
      );
      ({ container } = renderWith(<ManageServices />));
      screen.findByRole("heading", { name: "httpError.title" });
    });

    it("displays an error message", () => {
      const header = screen.getByRole("heading");
      const content = screen.getByRole("region");

      expect(header).toHaveTextContent("httpError.title");
      expect(content).toHaveTextContent("httpError.generic");
    });

    it("has no a11y violations", async () => {
      expect(await axe(container)).toHaveNoViolations();
    });
  });
});
