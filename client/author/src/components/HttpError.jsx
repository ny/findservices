import styles from "components/HttpError.module.css";
import React, { Fragment } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Button, Header } from "semantic-ui-react";
import PropTypes from "prop-types";

/**
 * Displays an error when calls to get data from the API fail.
 * This is an error state that indicates an issue with the data on the server.
 */
const HttpError = ({ errorMessage }) => {
  const { t } = useTranslation();

  return (
    <Fragment>
      <Header as="h1">{t("httpError.title")}</Header>
      <section aria-label={t("httpError.label")}>
        {errorMessage}
        <Link to="/app/services" className={styles.startOverLink} tabIndex={-1}>
          <Button primary fluid>
            {t("httpError.actions.startOver")}
          </Button>
        </Link>
      </section>
    </Fragment>
  );
};

HttpError.propTypes = {
  /** Error message to display on the generic HttpError page. */
  errorMessage: PropTypes.string.isRequired,
};

export default HttpError;
