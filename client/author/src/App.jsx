import React, { Fragment } from "react";
import { AppFooter, AppHeader } from "maslow-shared";
import Routes from "Routes";
import styles from "App.module.css";
import { Container } from "semantic-ui-react";

/**
 * Maslow entrypoint for application logic. All pages in Maslow have the same
 * header, <main> region for accessibility, and footer.
 */
export default function App() {
  return (
    <Fragment>
      <AppHeader showLanguageSwitcher={false} />
      <Container as="main" className={styles.content}>
        <Routes />
      </Container>
      <AppFooter />
    </Fragment>
  );
}
