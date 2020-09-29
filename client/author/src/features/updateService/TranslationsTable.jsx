import React, { useState, useEffect } from "react";
import { Table, Icon, Checkbox } from "semantic-ui-react";
import PropTypes from "prop-types";
import { localeToLanguageMap } from "utils/inputUtils";
import { useTranslation } from "react-i18next";
import styles from "features/updateService/TranslationsTable.module.css";
import _ from "lodash";

/**
 * TranslationsTable is a component that renders the table of translation
 * statuses, or a message indicating that text needs to be saved before
 * translations can be updated.
 */
function TranslationsTable({
  serviceKey,
  resourceVersions,
  markAllUpToDate,
  onUpToDateChange,
}) {
  const [translationStatus, setTranslationStatus] = useState({});

  const { t } = useTranslation();

  // Maps different translation statuses to the the element that should be
  // rendered, which include an icon and text.
  const transStatusToElementMapping = {
    Missing: (
      <p>
        <Icon name="exclamation circle" color="red" />
        {t("manageServices.notTranslated")}
      </p>
    ),
    Outdated: (
      <p>
        <Icon name="check circle outline" color="yellow" />
        {t("manageServices.outdated")}
      </p>
    ),
    Current: (
      <p>
        <Icon name="check circle outline" color="green" />
        {t("manageServices.translated")}
      </p>
    ),
  };

  useEffect(() => {
    const status = {};
    const lngs = Object.keys(localeToLanguageMap);
    lngs.forEach((lng) => {
      if (lng !== "en") {
        if (!(lng in resourceVersions)) {
          status[lng] = "Missing";
        } else if (resourceVersions[lng] !== resourceVersions["en"]) {
          status[lng] = "Outdated";
        } else {
          status[lng] = "Current";
        }
      }
    });
    setTranslationStatus(status);
  }, [setTranslationStatus, resourceVersions]);

  // Check if all translations are up to date.
  const areAllUpToDate = () => {
    return _.every(
      _.values(translationStatus),
      (status) => status === "Current"
    );
  };

  return (
    <Table>
      <Table.Body>
        {Object.keys(translationStatus).map((lng) => {
          return (
            <Table.Row key={lng}>
              <Table.Cell className={styles.firstCell}>
                {localeToLanguageMap[lng]} ({lng})
              </Table.Cell>
              <Table.Cell>
                {transStatusToElementMapping[translationStatus[lng]]}
              </Table.Cell>
              <Table.Cell>
                <a
                  aria-label={`edit-${serviceKey}-${lng}`}
                  href={`/app/services/update/${serviceKey}/locale/${lng}`}
                >
                  <Icon name="pencil" />
                </a>
              </Table.Cell>
            </Table.Row>
          );
        })}
        {!areAllUpToDate() && (
          <Table.Row>
            <Table.Cell colSpan="3">
              <Checkbox
                aria-label={t("updateService.markAllUpToDate")}
                toggle
                onChange={onUpToDateChange}
                checked={markAllUpToDate}
                className={styles.checkbox}
              />
              <span className={styles.toggleLabel}>
                {t("updateService.markAllUpToDate")}
              </span>
            </Table.Cell>
          </Table.Row>
        )}
      </Table.Body>
    </Table>
  );
}

TranslationsTable.propTypes = {
  /** Key of the service. */
  serviceKey: PropTypes.string.isRequired,
  /**
   * An object indicating the version of translations for each language.
   */
  resourceVersions: PropTypes.object.isRequired,
  /**
   * Boolean that indicates the checked status of the 'all up to date'
   * checkbox.
   */
  markAllUpToDate: PropTypes.bool.isRequired,
  /**
   * A function to execute if the 'all up to date' translation checkbox is
   * clicked.
   */
  onUpToDateChange: PropTypes.func.isRequired,
};

export default TranslationsTable;
