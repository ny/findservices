import GenericErrorPage from "components/GenericErrorPage";
import { StickToBottom } from "components/StickToBottom";
import { selectResponses } from "features/review/slices/responsesSlice";
import styles from "features/survey/components/Survey.module.css";
import SurveyIntro from "features/survey/components/SurveyIntro";
import SurveySection from "features/survey/components/SurveySection";
import _ from "lodash";
import React, { Fragment, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { useLocation } from "react-router";
import { Link, useHistory } from "react-router-dom";
import { Button, Message } from "semantic-ui-react";
import { sendFormEvent } from "util/analytics";

/**
 * Renders a survey. A survey is comprised of sections (or steps) and each
 * section has one or more questions. The main responsibility of this component
 * is to route between various survey states and provide navigation between the
 * survey sections.
 */
export default function Survey() {
  const { t } = useTranslation();
  const history = useHistory();
  const location = useLocation();

  const survey = useSelector((state) => state["survey"]) || [];

  // Typically the current step is initialized to 0, but here we check if a
  // value for step was provided as state to the current route. This makes it
  // possible to deep-link to a particular step in the survey from code (which
  // otherwise isn't possible because the step is not surfaced in the URL.) We
  // take advantage of this feature on the {@link Review} page where we allow
  // residents to go back and edit their responses from a particular step.
  const [step, setStep] = useState(_.get(location, "state.step", 0));

  const size = survey.length;

  const isErrorPage = size === 0;
  const isIntroPage = step === 0 && size > 0;
  const isFinalPage = step >= size;

  const [error, setError] = useState(false);
  const responses = useSelector(selectResponses);

  /**
   * Returns true if the resident has provided valid responses for all questions
   * in a given section. This method is called prior to navigating away from a
   * section of questions.
   */
  const validateResponses = () => {
    if (isIntroPage) {
      // On SurveyIntro page, we do not need to check responses to any questions.
      return true;
    }
    const sectionInfo = survey[step - 1];
    const questionKeys = _.values(sectionInfo)[0];
    const responseKeys = Object.keys(responses);

    const complete = questionKeys.every((key) => responseKeys.includes(key));
    setError(!complete);
    return complete;
  };

  const handleNext = () => {
    const isValid = validateResponses();
    if (isValid) {
      if (!isIntroPage) {
        sendFormAnalytics();
      }
      // Initially do not show an error on next page even if previously we have
      // shown one.
      setError(false);
      setStep(Math.min(size, step + 1));
    }
  };

  const handleDone = (e) => {
    e.preventDefault();
    const isValid = validateResponses();
    if (isValid) {
      sendFormAnalytics();
      history.push("/app/review");
    }
  };

  const handleBack = (evt) => {
    // Just change page -- don't navigate to another route.
    evt.preventDefault();
    // Can navigate backwards even if responses on current page are not valid.
    setError(false);
    setStep(Math.max(0, step - 1));
  };

  /**
   * Sends an event to the Google Analytics data layer containing the responses
   * selected in the current survey section. Does *not* validate the content of
   * the responses.
   */
  const sendFormAnalytics = () => {
    const sectionInfo = survey[step - 1];
    const questionKeys = _.values(sectionInfo)[0];

    const sectionResponses = _.entries(responses)
      .filter(([questionKey]) => questionKeys.includes(questionKey))
      .map(([key, value]) => [String(key), String(value)]);

    sendFormEvent(_.fromPairs(sectionResponses));
  };

  const renderNavigation = () => {
    return (
      <nav className={styles.nav}>
        <div>
          {isIntroPage && (
            <StickToBottom>
              <Button onClick={handleNext} primary fluid>
                {t("survey.actions.init")}
              </Button>
            </StickToBottom>
          )}
          {!isIntroPage && !isFinalPage && (
            <Button onClick={handleNext} primary fluid>
              {t("survey.actions.next")}
            </Button>
          )}
          {isFinalPage && (
            <Button onClick={handleDone} primary fluid>
              {t("survey.actions.done")}
            </Button>
          )}
        </div>
        {error && (
          <Message
            className={styles.error}
            visible
            error
            size="small"
            role="alert"
          >
            {t("survey.error.validation")}
          </Message>
        )}
        {!isIntroPage && (
          <Link
            to=""
            className={error ? styles.anchorError : styles.anchor}
            onClick={handleBack}
          >
            {t("survey.actions.back")}
          </Link>
        )}
      </nav>
    );
  };

  return (
    <Fragment>
      {isErrorPage && <GenericErrorPage />}
      {isIntroPage && <SurveyIntro />}
      {!isErrorPage && !isIntroPage && (
        <SurveySection step={step} survey={survey} error={error} />
      )}
      {!isErrorPage && renderNavigation()}
    </Fragment>
  );
}
