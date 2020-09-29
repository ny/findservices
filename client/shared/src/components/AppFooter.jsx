import styles from "./AppFooter.module.css";
import React from "react";
import { useTranslation } from "react-i18next";
import { Grid, Icon } from "semantic-ui-react";

/**
 * A React component implementing the app-wide footer. Per NYS guidelines, only
 * this application specific footer is implemented. The universal footer is
 * excluded for interactive web applications.
 */
export function AppFooter() {
  const { t } = useTranslation();

  return (
    <footer className={styles.footer}>
      <Grid stackable divided>
        <Grid.Column width={4} className={styles.agencyNameGrid}>
          <a
            className={styles.agencyName}
            href="https://ny.gov/services"
            aria-label={t("footer.title.label")}
          >
            {t("footer.title.text")}
          </a>
        </Grid.Column>
        <Grid.Column width={12}>
          <Grid className={styles.footerLinksGrid}>
            <Grid.Column
              mobile={8}
              tablet={4}
              computer={3}
              className={styles.footerLinks}
            >
              <a href="https://www.ny.gov/node/55121">
                {t("footer.accessibility.text")}
              </a>
            </Grid.Column>
            <Grid.Column
              mobile={8}
              tablet={4}
              computer={3}
              className={styles.footerLinks}
            >
              <a href="https://www.ny.gov/node/55126">
                {t("footer.disclaimer.text")}
              </a>
            </Grid.Column>
            <Grid.Column
              mobile={8}
              tablet={4}
              computer={3}
              className={styles.footerLinks}
            >
              <a href="https://www.ny.gov/node/56891">
                {t("footer.privacyPolicy.text")}
              </a>
            </Grid.Column>
            <Grid.Column
              mobile={8}
              tablet={4}
              computer={3}
              floated="right"
              className={styles.footerLinks}
            >
              <a
                href="https://twitter.com/nygov"
                aria-label={t("footer.twitter.label")}
              >
                <Icon
                  className={styles.socialLinks}
                  name="twitter"
                  size="large"
                />
              </a>
              <a
                href="https://www.instagram.com/nygov/"
                aria-label={t("footer.instagram.label")}
              >
                <Icon
                  className={styles.socialLinks}
                  name="instagram"
                  size="large"
                />
              </a>
            </Grid.Column>
          </Grid>
        </Grid.Column>
      </Grid>
    </footer>
  );
}
