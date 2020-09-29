import styles from "components/GenericErrorPage.module.css";
import React, { Fragment } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Button, Header } from "semantic-ui-react";

/**
 * A general-purpose error page, used as a fallback component if the application
 * does not have some state that it requires to properly render.
 */
const GenericErrorPage = () => {
  const { t } = useTranslation();

  return (
    <Fragment>
      <Header as="h1">{t("survey.error.title")}</Header>
      <section aria-label={t("survey.error.label")}>
        {t("survey.error.text")}
        <Link
          to={{ pathname: "https://ny.gov/services" }}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.seeAllServicesLink}
          tabIndex={-1}
        >
          <Button primary fluid>
            {t("survey.actions.seeAllServices")}
          </Button>
        </Link>
      </section>
    </Fragment>
  );
};

export default GenericErrorPage;
