import "@testing-library/jest-dom/extend-expect";
import reduceResponses, {
  clearResponses,
  deleteResponse,
  updateResponse,
  updateResponses,
  selectResponse,
  selectResponses,
} from "features/review/slices/responsesSlice";

describe("redux slice for responses", () => {
  const empty = {};

  describe("using reducers", () => {
    it("initializes with empty state", async () => {
      const state = undefined;
      const after = reduceResponses(state, { type: undefined });
      expect(after).toEqual(empty);
    });

    it("deletes single response", async () => {
      const state = { a: 1 };
      const after = reduceResponses(state, deleteResponse("a"));
      expect(after).toEqual(empty);
    });

    it("deletes all responses", async () => {
      const state = { a: 1, b: 2, c: 3 };
      const after = reduceResponses(state, clearResponses());
      expect(after).toEqual(empty);
    });

    it("updates single response", async () => {
      const state = { a: 1 };
      const after = reduceResponses(empty, updateResponse(state));
      expect(after).toEqual(state);
    });

    it("updates multiple responses", async () => {
      const state = { a: 1, b: 2, c: 3 };
      const after = reduceResponses(
        empty,
        updateResponses({ responses: state })
      );
      expect(after).toEqual(state);
    });
  });

  describe("using selectors", () => {
    describe("with valid state", () => {
      const state = {
        responses: { a: 1, b: 2, c: 3 },
      };

      it("selects single response", async () => {
        const observed = selectResponse(state, "a");
        expect(observed).toEqual(1);
      });

      it("selects all responses", async () => {
        const observed = selectResponses(state);
        expect(observed).toEqual(state.responses);
      });

      it("returns undefined when selecting single response with missing key", async () => {
        const state = {
          responses: { a: 1, b: 2, c: 3 },
        };
        const observed = selectResponse(state, "d");
        expect(observed).toBeUndefined();
      });
    });

    // To be clear, invalid state is generally a sign of a coding error
    // configuring initial state or test fixture setup error -- it should not
    // happen if the store is mutated entirely through actions and reducers.
    describe("with state not wrapped in 'responses' field", () => {
      const state = { a: 1, b: 2, c: 3 };

      it("throws when selecting single response", async () => {
        expect(() => selectResponse(state, "a")).toThrow();
      });

      it("returns undefined when selecting all responses", async () => {
        const observed = selectResponses(state);
        expect(observed).toBeUndefined();
      });
    });
  });
});
