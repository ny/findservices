import React, { Fragment } from "react";
import { Trans, useTranslation } from "react-i18next";
import { Divider, Header, Image } from "semantic-ui-react";
import markdown from "maslow-shared/src/components/Markdown.module.css";
import checklist from "../../../resources/images/checklist.svg";
import styles from "features/survey/components/Survey.module.css";

/**
 * Renders the introduction to the survey.
 */
const SurveyIntro = () => {
  const { t } = useTranslation();

  return (
    <Fragment>
      <Image
        alt=""
        aria-hidden={true}
        className={styles.checklist}
        src={checklist}
        centered
      />
      <Header as="h1">{t("survey.intro.title")}</Header>
      {/* The Trans component will still translate this text based on the given "i18nKey", but by writing it out in the component, we can indicate which piece is the link. */}
      <Trans i18nKey="survey.intro.body">
        See our
        <a
          href="https://www.ny.gov/privacy-policy"
          className={markdown.external}
          target="_blank"
          rel="noopener noreferrer"
        >
          Privacy Policy
        </a>
        for more information.
      </Trans>
      <Divider className={styles.divider} />
      <section>
        <strong>{t("survey.intro.howItWorks.title")}</strong>
        <ol className={styles.numbers}>
          <li>{t("survey.intro.howItWorks.stepOne")}</li>
          <li>{t("survey.intro.howItWorks.stepTwo")}</li>
          <li>{t("survey.intro.howItWorks.stepThree")}</li>
        </ol>
      </section>
    </Fragment>
  );
};

export default SurveyIntro;
