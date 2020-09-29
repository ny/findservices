import { clearReport } from "features/report/slices/reportSlice";
import {
  deleteResponse,
  selectResponse,
  updateResponse,
} from "features/review/slices/responsesSlice";
import BooleanQuestion from "features/survey/components/BooleanQuestion";
import NumberQuestion from "features/survey/components/NumberQuestion";
import { isEmpty, isNil } from "lodash";
import PropTypes from "prop-types";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import _ from "lodash";

/**
 * Provides conversion between the representation of boolean responses used by
 * BooleanQuestion (state) and what we use within Redux (store).
 *
 * The conversion maps ["", "yes", "no"] to/from [undefined, true, false].
 */
export class BooleanConverter {
  static _store = [undefined, true, false];
  static _state = ["", "yes", "no"];
  static _convert(value, source, target) {
    return target[_.findIndex(source, (elem) => elem === value)];
  }

  static stateToStore(value) {
    return BooleanConverter._convert(
      value,
      BooleanConverter._state,
      BooleanConverter._store
    );
  }

  static storeToState(value) {
    return (
      BooleanConverter._convert(
        value,
        BooleanConverter._store,
        BooleanConverter._state
      ) || ""
    );
  }
}

/**
 * Provides conversion between the representation of numeric responses used by
 * NumberQuestion (state) and that we use within Redux (store).
 *
 * The conversion maps number-like strings to/from numbers. It also maps ""
 * to/from null. Allowing "" ensures that residents can delete any value that
 * they've entered.
 */
export class NumberConverter {
  static stateToStore(value) {
    return isEmpty(value) ? undefined : Math.max(0, Math.floor(Number(value)));
  }

  static storeToState(value) {
    return isNil(value) ? "" : Number(value).toFixed();
  }
}

/**
 * Returns the appropriate Question and Converter types for the provided
 * question type.
 */
export class QuestionFactory {
  static create(questionType) {
    switch (questionType) {
      case "BOOLEAN":
        return { Question: BooleanQuestion, Converter: BooleanConverter };
      case "CURRENCY":
      case "NUMBER":
        return { Question: NumberQuestion, Converter: NumberConverter };
      default:
        throw new Error("Invalid question type.");
    }
  }
}

/**
 * Renders the appropriate survey question based on its type and synchronizes
 * its state with Redux.
 *
 * @component
 */
export default function SurveyQuestion(props) {
  const { error, questionKey, questionType } = props;
  const dispatch = useDispatch();
  const response = useSelector((state) => selectResponse(state, questionKey));

  const { Question, Converter } = QuestionFactory.create(questionType);

  const handleChange = (event) => {
    const response = Converter.stateToStore(event.target.value);
    if (isNil(response)) {
      dispatch(deleteResponse(event.target.name));
    } else {
      dispatch(updateResponse({ [event.target.name]: response }));
    }
    dispatch(clearReport());
  };

  return (
    <Question
      {...props}
      error={error && isNil(response)}
      value={Converter.storeToState(response)}
      onChange={handleChange}
    />
  );
}

SurveyQuestion.propTypes = {
  /** The key of the question to be rendered. */
  questionKey: PropTypes.string.isRequired,
  /** The type of the question to be rendered. */
  questionType: PropTypes.oneOf(["BOOLEAN", "CURRENCY", "NUMBER"]).isRequired,
  /** If true, the question should validate that there is a valid response. */
  error: PropTypes.bool,
};
