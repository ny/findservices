import PropTypes from "prop-types";
import React from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "semantic-ui-react";

// Determines the status (up to date, outdated, missing translations) of the
// service's translations and returns what to render accordingly.
export function TranslationStatus({ service }) {
  const { t } = useTranslation();

  const allowed = ["bn", "en", "es", "ht", "ko", "ru", "zh"];
  const present = service.resourceVersions;
  const missing = !allowed.every((locale) => locale in present);
  const outdated = !Object.keys(present).every(
    (locale) => present[locale] === present["en"]
  );

  if (missing) {
    return (
      <p>
        <Icon name="exclamation circle" color="red" />
        {t("manageServices.notTranslated")}
      </p>
    );
  }

  if (outdated) {
    return (
      <p>
        <Icon name="check circle outline" color="yellow" />
        {t("manageServices.outdated")}
      </p>
    );
  }

  return (
    <p>
      <Icon name="check circle outline" color="green" />
      {t("manageServices.translated")}
    </p>
  );
}

TranslationStatus.propTypes = {
  /** A service that contains a map of resourceVersions. */
  service: PropTypes.shape({
    resourceVersions: PropTypes.object.isRequired,
  }).isRequired,
};
