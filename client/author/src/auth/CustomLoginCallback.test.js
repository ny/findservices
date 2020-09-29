import "@testing-library/jest-dom/extend-expect";
import { screen } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import React from "react";
import { renderWith } from "maslow-shared/src/util/testing";
import CustomLoginCallback from "./CustomLoginCallback";

expect.extend(toHaveNoViolations);

const mockAuthState = jest.fn();

jest.mock("@okta/okta-react", () => ({
  useOktaAuth: () => ({
    authState: mockAuthState(),
    authService: { handleAuthentication: jest.fn() },
  }),
}));

describe.skip("isAuthenticated is false", () => {
  let container;

  beforeEach(() => {
    mockAuthState.mockReturnValue({ isAuthenticated: false });
    ({ container } = renderWith(<CustomLoginCallback />));
  });

  it("failed authentication by not being logged in and displays message", () => {
    const text = screen.getByText("authentication.notLoggedIn");
    expect(text).not.toBeNull();
  });

  it("has no axe violations", async () => {
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe.skip("isAuthenticated is true", () => {
  let container;

  beforeEach(() => {
    mockAuthState.mockReturnValue({ isAuthenticated: true });
    ({ container } = renderWith(<CustomLoginCallback />));
  });

  it("passed authentication and is redirecting", async () => {
    expect(container.firstChild).toBeNull();
  });

  it("has no axe violations", async () => {
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe.skip("authentication error", () => {
  let container;

  beforeEach(() => {
    mockAuthState.mockReturnValue({ error: true });
    ({ container } = renderWith(<CustomLoginCallback />));
  });

  it("displays authentication errors", () => {
    const text = screen.getByText("authentication.authFailedRedirect");
    expect(text).not.toBeNull();
  });

  it("has no axe violations", async () => {
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe.skip("pending authentication", () => {
  let container;

  beforeEach(() => {
    mockAuthState.mockReturnValue({ isPending: true });
    ({ container } = renderWith(<CustomLoginCallback />));
  });

  it("is pending authentication", () => {
    const text = screen.getByText("authentication.loading");
    expect(text).not.toBeNull();
  });

  it("has no axe violations", async () => {
    expect(await axe(container)).toHaveNoViolations();
  });
});
