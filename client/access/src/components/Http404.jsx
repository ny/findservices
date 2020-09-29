import styles from "components/Http404.module.css";
import markdownStyles from "maslow-shared/src/components/Markdown.module.css";
import React, { Fragment } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Button, Header } from "semantic-ui-react";

/**
 * A React fragment that renders error text for pages that don't exist. Some
 * links are provided that go back to the start of the app and the state
 * services website.
 */
export default function Http404() {
  const { t } = useTranslation();

  return (
    <Fragment>
      <Header as="h1">{t("http404.error.title")}</Header>
      <section aria-label={t("http404.error.label")}>
        {t("http404.error.text")}
        <Link to="/app/survey" className={styles.startOverLink} tabIndex={-1}>
          <Button primary fluid>
            {t("http404.actions.startOver")}
          </Button>
        </Link>
        <a
          href="https://ny.gov/services"
          className={markdownStyles.external}
          target="_blank"
          rel="noopener noreferrer"
        >
          {t("http404.actions.seeAllServices")}
        </a>
      </section>
    </Fragment>
  );
}
