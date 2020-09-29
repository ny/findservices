import styles from "features/review/components/ReviewSection.module.css";
import { selectResponses } from "features/review/slices/responsesSlice";
import { selectSurvey } from "features/survey/slices/surveySlice";
import { selectQuestions } from "features/survey/slices/questionsSlice";
import PropTypes from "prop-types";
import React from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Header } from "semantic-ui-react";

/** Displays the question followed by the resident's response for a specific section of questions. */
function ReviewSection(props) {
  const { sectionKey, questionKeys } = props;
  const { t } = useTranslation();
  const responses = useSelector(selectResponses);
  const questions = useSelector(selectQuestions);
  const survey = useSelector(selectSurvey);

  // Displays the number entry either formatted as currency or a whole number.
  const displayNumber = (questionKey) => {
    const questionMetadata = questions[questionKey];
    return questionMetadata.type === "CURRENCY"
      ? currencyFormatter.format(responses[questionKey])
      : numberFormatter.format(responses[questionKey]);
  };

  // Returns a list of the questions with corresponding responses.
  const displayQuestionItems = (questionKeys) => {
    const item = (questionKey, response) => {
      return (
        <div key={questionKey}>
          <span className={styles.question}>
            {t(`catalog:${questionKey}.text`)}
          </span>
          &nbsp;
          <p className={styles.response}>{response}</p>
          &nbsp;
        </div>
      );
    };
    return questionKeys.map((questionKey) => {
      const type = questions[questionKey].type;
      if (isBooleanAndTrue(responses, questionKey, type)) {
        return item(questionKey, t("survey.question.boolean.yes"));
      } else if (isBooleanAndFalse(responses, questionKey, type)) {
        return item(questionKey, t("survey.question.boolean.no"));
      } else if (isNumericAndExists(responses, questionKey, type)) {
        return item(questionKey, displayNumber(questionKey));
      } else {
        return "";
      }
    });
  };

  const pageNumberFromSection = (sectionKey) => {
    for (let i = 0; i < survey.length; i++) {
      const section = survey[i];
      if (section[sectionKey]) {
        return i + 1;
      }
    }
  };

  return (
    <>
      <h2 className={styles.step}>
        {t("review.step", { step: pageNumberFromSection(sectionKey) })}
      </h2>
      <Header as="h2" className={styles.header}>
        {t(`catalog:${sectionKey}.title`)}
        <Link
          to={{
            pathname: "/app/survey",
            state: {
              step: pageNumberFromSection(sectionKey),
            },
          }}
          className={styles.edit}
        >
          {t(`review.actions.edit`)}
        </Link>
      </Header>
      <div className={styles.compact}>{displayQuestionItems(questionKeys)}</div>
    </>
  );
}

const numberFormatter = new Intl.NumberFormat("en-US");
const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});
// Determines if a boolean question is answered and true.
const isBooleanAndTrue = (responses, questionKey, type) => {
  return responses[questionKey] && type === "BOOLEAN";
};
// Determines if a boolean question is answered and false.
const isBooleanAndFalse = (responses, questionKey, type) => {
  return responses[questionKey] === false && type === "BOOLEAN";
};
// Determines if a question is answered and has a numeric value.
const isNumericAndExists = (responses, questionKey, type) => {
  return (type === "NUMBER" || type === "CURRENCY") && questionKey in responses;
};

ReviewSection.propTypes = {
  /** Key of a section of questions. */

  sectionKey: PropTypes.string,
  /** List of keys corresponding to questions within a section. */
  questionKeys: PropTypes.arrayOf(PropTypes.string),
};

export default ReviewSection;
