import "@testing-library/jest-dom/extend-expect";
import reduceQuestions, {
  updateQuestions,
  selectQuestions,
} from "features/survey/slices/questionsSlice";

test("initial state", () => {
  expect(reduceQuestions(undefined, { type: undefined })).toEqual({});
});

test("questions update", () => {
  const questions = {
    HOUSEHOLD_SIZE: {
      type: "NUMBER",
    },
    ADULTS_65_PLUS: {
      type: "BOOLEAN",
    },
  };
  expect(
    reduceQuestions(
      {},
      {
        type: updateQuestions.type,
        payload: {
          questions: questions,
        },
      }
    )
  ).toEqual(questions);
});

describe("using selector", () => {
  const state = {
    questions: {
      HOUSEHOLD_SIZE: {
        type: "NUMBER",
      },
      ADULTS_65_PLUS: {
        type: "BOOLEAN",
      },
    },
  };

  it("selects all questions", async () => {
    const observed = selectQuestions(state);
    expect(observed).toEqual(state.questions);
  });
});
