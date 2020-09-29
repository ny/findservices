import SetTitle from "components/SetTitle";
import SurveyQuestion from "features/survey/components/SurveyQuestion";
import styles from "features/survey/components/SurveySection.module.css";
import { selectQuestions } from "features/survey/slices/questionsSlice";
import _ from "lodash";
import { useScrollToTop } from "maslow-shared";
import PropTypes from "prop-types";
import React, { Fragment, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { Form, Header, Ref } from "semantic-ui-react";
import { sendPageViewEvent } from "util/analytics";

/**
 * Renders a single section (or step) of the survey.
 */
function SurveySection({ step, survey, error }) {
  // Send a Google Analytics page view.
  useEffect(
    () => sendPageViewEvent(`/questions-${step}`, `Questions ${step}`),
    [step]
  );

  // Scroll to top of the viewport at each survey step.
  useScrollToTop([step]);

  const { t } = useTranslation();
  const questions = useSelector(selectQuestions);
  const focusRef = useRef(null);

  // Reset page focus when navigating between Survey steps
  useEffect(() => {
    focusRef.current && focusRef.current.focus();
  }, [step]);

  const size = survey.length;
  const section = survey[step - 1];
  const [sectionKey, questionKeys] = _(section).entries().first();

  const translatedTitle = t(`catalog:${sectionKey}.title`);
  const translatedStep = t("survey.actions.step", { step: step, size: size });

  return (
    <Fragment>
      <SetTitle title={`${translatedTitle}: ${translatedStep}`} />
      <div role="status" className={styles.progress}>
        {translatedStep}
      </div>
      <Form>
        {/* NOTE: The Ref copmonent is eventually going to be deprecated in
        favor of React.forwardRef, but for now this is the only option 
        compatible with Semantic UI's implementation.*/}
        <Ref innerRef={focusRef}>
          <Header className={styles.sectionHeading} tabIndex={-1} as="h1">
            {translatedTitle}
          </Header>
        </Ref>
        {questionKeys
          .map((key) => [key, questions[key].type])
          .map(([key, type]) => (
            <SurveyQuestion
              key={key}
              error={error}
              questionKey={key}
              questionType={type}
            />
          ))}
      </Form>
    </Fragment>
  );
}

/**
 * Validates that the prop is a non-negative integer (that is, greater than or
 * equal to zero).
 */
function nonNegativeInteger(props, propName, componentName) {
  function isNonNegativeInteger(value) {
    return Number.isInteger(value) && value >= 0;
  }

  const value = props[propName];
  if (!isNonNegativeInteger(value)) {
    return new Error(
      `Invalid prop '${propName}' supplied to '${componentName}'. Must be an integer greater than or equal to zero.`
    );
  }
}

SurveySection.propTypes = {
  /** The current survey section (or step) to display  */
  step: nonNegativeInteger,
  /** An array of objects that holds section keys and question keys. */
  survey: PropTypes.array,
  /**
   * If true, display any validation error messages. The default value for this
   * prop is false because we don't want to display any validation error message
   * before the user has had a chance to type something in. The parent component
   * sets this prop to true when the user triggers validation (such as clicking
   * "submit" or "done" on the parent form.)
   */
  error: PropTypes.bool,
};

SurveySection.defaultProps = {
  step: 1,
  survey: [],
  error: false,
};

export default SurveySection;
