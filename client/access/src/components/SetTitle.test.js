import { waitFor } from "@testing-library/react";
import { renderWith } from "maslow-shared/src/util/testing";
import React from "react";
import SetTitle from "./SetTitle";

describe("SetTitle", () => {
  it("sets a default title when none is provided", async () => {
    renderWith(<SetTitle />);

    await waitFor(() =>
      expect(document.title).toBe("htmlTitle.default | htmlTitle.suffix")
    );
  });

  it("changes the title when one is provided", async () => {
    renderWith(<SetTitle title="foo" />);

    await waitFor(() => expect(document.title).toBe("foo | htmlTitle.suffix"));
  });
});
