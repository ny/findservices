import { kebabCase } from "lodash";
import PropTypes from "prop-types";
import React from "react";
import { useTranslation } from "react-i18next";
import { Form, Input, Message } from "semantic-ui-react";

/**
 * Renders a question of type NUMBER or CURRENCY as a number-typed form input.
 * This component is intended to be used as a controlled component -- that is,
 * it requires that the parent provides values for both the {@linkcode #value}
 * and {@linkcode #onChange} props.
 *
 * NUMBER and CURRENCY are treated almost identically -- the only difference is
 * that CURRENCY questions are rendered with a decorative currency symbol.
 */
function NumberQuestion({ questionKey, questionType, value, onChange, error }) {
  const { t } = useTranslation();
  const questionId = kebabCase(questionKey);

  /**
   * Return the props to be appended to Semantic UI's <Input> component when we
   * need to display the decorative currency symbol. Note that the "currency"
   * icon is a custom icon that was added to our site theme for Semantic UI. See
   * {@link client/src/theme/_site/elements/icon.overrides} for details.
   *
   * Note that the typing below is required to make the TypeScript typechecker
   * happy, since the {@linkcode Input#iconPosition} prop is strangely typed as
   * type "left", not a string.
   *
   * @returns {?{icon: string, iconPosition: "left"}}
   */
  const getIconProps = () => {
    return (
      questionType === "CURRENCY" && {
        icon: "currency",
        iconPosition: "left",
      }
    );
  };

  // It's worth noting that we absolutely hammer the <Input> below with similar
  // props like `type="number"`, `inputMode="numeric"`, and `pattern="[0-9*]"`.
  // These three variations of what seem like the same thing are required to
  // ensure both that we use HTML5 number validation and that we correctly
  // display the number keypad (instead of the alphanumeric keyboard) on both
  // iOS and Android.
  return (
    <Form.Field required error={error}>
      <label htmlFor={questionId}>{t(`catalog:${questionKey}.text`)}</label>
      <small id={`${questionId}-hint`}>
        {t(`catalog:${questionKey}.hint`, "")}
      </small>
      <Input
        id={questionId}
        required
        type="number"
        inputMode="numeric"
        pattern="[0-9]*"
        step="1"
        min="0"
        name={questionKey}
        value={value}
        onChange={onChange}
        {...getIconProps()}
        aria-invalid={error}
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
          {t("survey.question.number.error")}
        </Message>
      )}
    </Form.Field>
  );
}

NumberQuestion.propTypes = {
  /** The key of the question to be rendered. */
  questionKey: PropTypes.string.isRequired,
  /** The type of the question to be rendered. */
  questionType: PropTypes.oneOf(["NUMBER", "CURRENCY"]).isRequired,
  /** The current value of the question. */
  value: PropTypes.string.isRequired,
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

NumberQuestion.defaultProps = {
  questionType: "NUMBER",
  error: false,
};

export default NumberQuestion;
