import SetTitle from "components/SetTitle";
import { StickToBottom } from "components/StickToBottom";
import { clearReport } from "features/report/slices/reportSlice";
import styles from "features/review/components/Review.module.css";
import ReviewSection from "features/review/components/ReviewSection";
import { clearResponses } from "features/review/slices/responsesSlice";
import { selectSurvey } from "features/survey/slices/surveySlice";
import React, { Fragment, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Button, Divider, Header } from "semantic-ui-react";
import { sendPageViewEvent } from "util/analytics";
import AppLayout from "components/AppLayout";
import _ from "lodash";

/**
 * Displays a summary of the resident's responses, giving them an opportunity to
 * edit their responses before continuing on to view the services we've
 * recommended for them.
 */
function Review() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const sections = useSelector(selectSurvey);

  useEffect(
    () => sendPageViewEvent("/questions-review", "Questions Review"),
    []
  );

  // Clear responses and services report when starting over.
  const handleStartOver = () => {
    dispatch(clearResponses());
    dispatch(clearReport());
  };

  return (
    <AppLayout>
      <SetTitle title={t("review.htmlTitle")} />
      <Header as="h1">{t("review.title")}</Header>
      {sections.map((section) => {
        return _.entries(section).map(([sectionKey, questionKeys]) => {
          return (
            <Fragment key={sectionKey}>
              <ReviewSection
                key={sectionKey}
                sectionKey={sectionKey}
                questionKeys={questionKeys}
              />
              <Divider className={styles.divider} />
            </Fragment>
          );
        });
      })}
      <StickToBottom>
        <nav>
          <div>
            <Link to="/app/services" tabIndex={-1}>
              <Button primary fluid>
                {t("review.actions.next")}
              </Button>
            </Link>
          </div>
          <div className={styles.anchor}>
            <Link to="/app/survey" onClick={handleStartOver}>
              {t("review.actions.restart")}
            </Link>
          </div>
        </nav>
      </StickToBottom>
    </AppLayout>
  );
}

export default Review;
