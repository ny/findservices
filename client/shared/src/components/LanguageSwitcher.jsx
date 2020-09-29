import React from "react";
import { useTranslation } from "react-i18next";
import { Dropdown, Image, Menu } from "semantic-ui-react";
import globe from "../resources/images/globe.svg";
import styles from "./LanguageSwitcher.module.css";

/**
 * A component that allows the user to switch the language. Switching the
 * language changes the language configured through i18next and triggers an
 * event that re-renders all the content that uses the `t` functions.
 */
export function LanguageSwitcher() {
  const { t, i18n } = useTranslation();

  const languageOptions = [
    // English
    { text: "English", value: "en" },
    // Spanish
    { text: "Español", value: "es" },
    // Haitian Creole
    { text: "Kreyòl Ayisyen", value: "ht" },
    // Russian
    { text: "русский", value: "ru" },
    // Bengali
    { text: "বাংলা", value: "bn" },
    // Korean
    { text: "한국어", value: "ko" },
    // Chinese
    { text: "中文", value: "zh" },
  ];

  const changeLanguage = (e, { value }) => {
    i18n.changeLanguage(value);
  };

  return (
    <Menu.Menu>
      <Image src={globe} verticalAlign="middle" alt="" />
      <Dropdown
        aria-label={t("header.languageSwitcher.label")}
        className={styles.dropdown}
        direction="left"
        onChange={changeLanguage}
        value={i18n.language}
        options={languageOptions}
      />
    </Menu.Menu>
  );
}
