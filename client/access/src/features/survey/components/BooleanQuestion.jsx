import { kebabCase } from "lodash";
import PropTypes from "prop-types";
import React from "react";
import { useTranslation } from "react-i18next";
import { Form, Message } from "semantic-ui-react";

/**
 * Renders a question of type BOOLEAN as an accessible radio group with options
 * for "yes" and "no". This component is intended to be used as a controlled
 * component -- that is, it requires that the parent provide values for both the
 * {@linkcode #value} and {@linkcode #onChange} props.
 */
function BooleanQuestion(props) {
  const { questionKey, value, onChange, error } = props;

  const { t } = useTranslation();
  const questionId = kebabCase(questionKey);

  return (
    <Form.Group as="fieldset" className={error ? "error" : null} grouped>
      <legend>{t(`catalog:${questionKey}.text`)}</legend>
      <small>{t(`catalog:${questionKey}.hint`, "")}</small>
      <Form.Radio
        error={error}
        id={`${questionId}-yes`}
        name={questionKey}
        label={t("survey.question.boolean.yes")}
        value="yes"
        checked={value === "yes"}
        onChange={onChange}
        aria-describedby={`${questionId}-hint ${questionId}-error`}
      />
      <Form.Radio
        error={error}
        id={`${questionId}-no`}
        name={questionKey}
        label={t("survey.question.boolean.no")}
        value="no"
        checked={value === "no"}
        onChange={onChange}
        aria-describedby={`${questionId}-hint ${questionId}-error`}
      />
      {error && (
        <Message
          visible
          error
          id={`${questionId}-error`}
          size="small"
          role="alert"
        >
          {t("survey.question.boolean.error")}
        </Message>
      )}
    </Form.Group>
  );
}

BooleanQuestion.propTypes = {
  /** The key of the question to be rendered. */
  questionKey: PropTypes.string.isRequired,
  /** The current value of the question. */
  value: PropTypes.oneOf(["yes", "no", ""]).isRequired,
  /** The function to be called when the value changes. */
  onChange: PropTypes.func.isRequired,
  /**
   * If true, display any validation error messages. The default value for this
   * prop is false because we don't want to display any validation error message
   * before the user has had a chance to type something in. The parent component
   * sets this prop to true when the user triggers validation (such as clicking
   * "submit" or "done" on the parent form.)
   */
  error: PropTypes.bool,
};

BooleanQuestion.defaultProps = {
  error: false,
};

export default BooleanQuestion;
