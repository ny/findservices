import {
  selectRank,
  selectServices,
} from "features/services/slices/servicesSlice";
import { selectQuestions } from "features/survey/slices/questionsSlice";
import { selectSurvey } from "features/survey/slices/surveySlice";
import _ from "lodash";
import { evaluate } from "maslow-shared";
import React, { Fragment } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { Card, Header } from "semantic-ui-react";

/**
 * A React component that broadly validates the configuration received from the
 * server. This allows administrators to verify that the frontend is compatible
 * with any changes to the configuration made server-side.
 *
 * Validation occurs in 3 parts:
 *
 * 1. All services have formulas recognized by the formula parser.
 * 2. All services are assigned a rank.
 * 3. Structure of the survey (each section refers to questions that exist)
 */
export default function Checks() {
  const { t } = useTranslation();
  const services = useSelector(selectServices);
  const rank = useSelector(selectRank);
  const questions = useSelector(selectQuestions);
  const survey = useSelector(selectSurvey);
  const exampleResponses = getExampleResponses(questions);

  /**
   * Given a service formula, returns a 2-tuple describing formula validity.
   *
   * Successful response:
   * ```
   * [ "No errors detected", false ]
   * ```
   * Failed response:
   * ```
   * [ "Explanation why the formula is invalid.", true ]
   * ```
   */
  const getFormulaValidation = (serviceFormula) => {
    let evaluationMessage = t("checks.noErrors");
    let hasError = false;
    try {
      evaluate(serviceFormula, exampleResponses);
    } catch (err) {
      evaluationMessage = err.message;
      hasError = true;
    }
    return [evaluationMessage, hasError];
  };

  /**
   * Given a serviceKey, builds the object of properties expected by Semantic
   * UI's <Card.Group> component for the corresponding service. This includes
   * the service name, its eligibility formula, and any errors found while
   * parsing the formula.
   */
  const buildServiceCheckCardProps = (serviceKey) => {
    const service = services[serviceKey];
    let serviceFormula = service.formula;

    let evaluationMessage, formulaError;
    if (!_.isEmpty(serviceFormula)) {
      //@ts-ignore: assignment ordering matters due to mixed type array
      [evaluationMessage, formulaError] = getFormulaValidation(serviceFormula);
    } else {
      serviceFormula = "<" + t("checks.services.formulas.noFormula") + ">";
      // Empty formulas are valid.
      evaluationMessage = t("checks.noErrors");
      formulaError = false;
    }

    return {
      header: t(`catalog:${serviceKey}.name`),
      role: "listitem",
      description: evaluationMessage,
      meta: serviceFormula,
      color: formulaError ? "red" : "green",
      raised: true,
    };
  };

  /**
   * Generates an array of Semantic UI <Card> property objects, one object for
   * every service defined by the application. This array should be passed into
   * a <Card.Group> component's `items` prop.
   */
  const buildServiceValidationCards = () => {
    if (!rank) return [];
    // exclude services missing from service dictionary; this will trigger
    // an error in a different check
    return rank
      .filter((serviceKey) => serviceKey in services)
      .map(buildServiceCheckCardProps);
  };

  /**
   * Generates a singleton array with a Semantic UI <Card> property object that
   * indicates if any services are missing from the `rank` array. This array
   * should be passed into a <Card.Group> component's `items` prop.
   */
  const buildRankingValidationCard = () => {
    let evaluationMessage = t("checks.noErrors");

    const missingRank = Object.keys(services).filter(
      (service) => !rank.includes(service)
    );
    if (missingRank.length > 0) {
      evaluationMessage =
        t("checks.services.ranking.missingServices") +
        ":\n" +
        missingRank.join(", ");
    }
    return [
      {
        header: t("checks.services.ranking.cardTitle"),
        role: "listitem",
        description: evaluationMessage,
        color: missingRank.length > 0 ? "red" : "green",
        raised: true,
      },
    ];
  };

  /**
   * Generates a singleton array with a Semantic UI <Card> property object that
   * indicates if any questions defined in a survey section are not found within
   * the questions dictionary. This array response should be passed into a
   * <Card.Group> component's `items` prop.
   */
  const surveyQuestionsValidationCard = () => {
    const missingQuestionKeys = _.flatMap(survey, (section) => {
      const [questionKeys] = _.values(section);
      return questionKeys.filter((questionKey) => !(questionKey in questions));
    });

    const evaluationMessageForQuestions =
      missingQuestionKeys.length === 0
        ? t("checks.noErrors")
        : `${t("checks.survey.structure.missingQuestions")}:\n
            ${missingQuestionKeys.join(", ")}`;

    return [
      {
        header: t("checks.survey.structure.questionCardTitle"),
        role: "listitem",
        description: evaluationMessageForQuestions,
        color: missingQuestionKeys.length > 0 ? "red" : "green",
        raised: true,
      },
    ];
  };

  return (
    <Fragment>
      <Header as="h1">{t("checks.services.title")}</Header>
      <Header as="h2">{t("checks.services.formulas.title")}</Header>
      <Card.Group centered items={buildServiceValidationCards()} role="list" />
      <Header as="h2">{t("checks.services.ranking.title")}</Header>
      <Card.Group centered items={buildRankingValidationCard()} role="list" />
      <Header as="h1">{t("checks.survey.title")}</Header>
      <Card.Group
        centered
        items={surveyQuestionsValidationCard()}
        role="list"
      />
    </Fragment>
  );
}

/**
 * Generates a dictionary of sample responses for each question in the survey.
 * The dictionary is used to validate each service with the formula parser.
 *
 * Output format:
 * ```
 * {
 *  QUESTION_KEY_1: true, // for a boolean question
 *  QUESTION_KEY_2: 1000, // for a numeric/currency question
 * }
 * ```
 */
function getExampleResponses(questions) {
  /* Given a question type, returns a valid response value for that type. */
  const getExampleResponse = (questionType) => {
    switch (questionType) {
      case "CURRENCY":
      case "NUMBER": {
        return 1000;
      }
      default:
      case "BOOLEAN": {
        return true;
      }
    }
  };

  return _.entries(questions).reduce(
    (exampleResponses, [questionKey, question]) => {
      exampleResponses[questionKey] = getExampleResponse(question.type);
      return exampleResponses;
    },
    {}
  );
}
