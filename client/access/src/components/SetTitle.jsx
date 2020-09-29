import PropTypes from "prop-types";
import React from "react";
import { Helmet } from "react-helmet";
import { useTranslation } from "react-i18next";

/**
 *  A React component that renders nothing, but sets the `title` information in
 *  the page's `head` metadata content. When the user views a new logical page,
 *  (e.g. a new route in the URL bar) the page title should be changed to
 *  clarify the new application state. This is especially important for users
 *  navigating with a screen reader.
 */
export default function SetTitle({ title }) {
  const { t } = useTranslation();

  return (
    <Helmet
      titleTemplate={`%s | ${t("htmlTitle.suffix")}`}
      defaultTitle={`${t("htmlTitle.default")} | ${t("htmlTitle.suffix")}`}
    >
      <title>{title}</title>
    </Helmet>
  );
}

SetTitle.propTypes = {
  /* The desired page title content, which appears before the hard-coded suffix */
  title: PropTypes.string,
};

SetTitle.defaultProps = {
  // Forces the use of titleTemplate
  title: "",
};
