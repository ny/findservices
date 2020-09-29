import React from "react";
import { createMemoryHistory } from "history";
import { render } from "@testing-library/react";
import { waitFor } from "@testing-library/dom";
import { Router } from "react-router";
import { ScrollToTopOnRouteChange } from "./ScrollToTop";

global.scrollTo = jest.fn();

describe("Scrolling to top", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("occurs when the URL path changes", async () => {
    const history = createMemoryHistory();

    render(
      <Router history={history}>
        <ScrollToTopOnRouteChange />
      </Router>
    );

    expect(global.scrollTo).toHaveBeenCalledTimes(1);
    expect(global.scrollTo).toHaveBeenCalledWith(0, 0);

    history.push("/new-url");
    await waitFor(() => expect(global.scrollTo).toHaveBeenCalledTimes(2));
    expect(global.scrollTo).toHaveBeenCalledWith(0, 0);
  });
});
