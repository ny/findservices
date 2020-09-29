import PropTypes from "prop-types";
import React, { Fragment } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Divider, Image, Menu } from "semantic-ui-react";
import logo from "../resources/images/logo.svg";
import styles from "./AppHeader.module.css";
import { LanguageSwitcher } from "./LanguageSwitcher";

/**
 * Renders the application-wide header, which includes top-level navigation and
 * language selection.
 */
export function AppHeader({ showLanguageSwitcher }) {
  const { t } = useTranslation();

  return (
    <Fragment>
      <Menu as="header" borderless className={styles.header}>
        <Menu.Item>
          <Link to="/">
            <Image
              alt={t("header.logo.label")}
              className={styles.logo}
              src={logo}
            />
          </Link>
        </Menu.Item>
        {showLanguageSwitcher && (
          <Menu.Item position="right">
            <LanguageSwitcher />
          </Menu.Item>
        )}
      </Menu>
      <Divider as="hr" className={styles.divider} />
    </Fragment>
  );
}

AppHeader.propTypes = {
  /* True if/only if the language switcher should be displayed */
  showLanguageSwitcher: PropTypes.bool,
};

AppHeader.defaultProps = {
  showLanguageSwitcher: true,
};
