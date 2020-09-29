import styles from "components/AppLayout.module.css";
import Catalog from "components/Catalog";
import { AppFooter, AppHeader } from "maslow-shared";
import PropTypes from "prop-types";
import React, { Fragment, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Container, Ref } from "semantic-ui-react";

/**
 * A React component defining the page layout template for Maslow Access. All
 * pages have the same header, <main> region for accessibility, footer, and skip
 * to main content link.
 */
// Note: This component *must* appear as a child of the components rendered by
// React Router. Doing so will ensure that the skip to main content link always
// appears first in the tab order when navigating to a new route.
export default function AppLayout({ children }) {
  const { t } = useTranslation();
  const skipRef = useRef(null);

  const skipToMainContent = () => {
    if (skipRef.current) {
      skipRef.current.focus();
      skipRef.current.scrollIntoView(true);
    }
  };

  return (
    <Fragment>
      <button className={styles.srOnly} onClick={skipToMainContent}>
        {t("header.skipToContent")}
      </button>
      <AppHeader />
      <Ref innerRef={skipRef}>
        <Container text as="main" className={styles.content} tabIndex={-1}>
          <Catalog>{children}</Catalog>
        </Container>
      </Ref>
      <AppFooter />
    </Fragment>
  );
}

AppLayout.propTypes = {
  /* A React element (which may contain nested elements) to render with the
   * app-wide page structure.
   */
  children: PropTypes.node,
};
