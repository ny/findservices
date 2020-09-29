import SetTitle from "components/SetTitle";
import { selectSelectedServices } from "features/report/slices/reportSlice";
import Bucket from "features/services/components/Bucket";
import SelectedServices from "features/services/components/SelectedServices";
import styles from "features/services/components/Services.module.css";
import {
  selectRankedMatchingServiceKeys,
  selectRankedNoFormulaServiceKeys,
} from "features/services/slices/servicesSlice";
import markdown from "maslow-shared/src/components/Markdown.module.css";
import React, { Fragment, useEffect } from "react";
import { Trans, useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { Divider, Header } from "semantic-ui-react";
import { sendPageViewEvent } from "util/analytics";
import _ from "lodash";

/**
 * Renders a group (i.e. "Bucket") of services whose formula match the user's
 * survey responses, a group of all services that do not have formulas and a
 * link to the ny.gov/services page to see all eligible services.
 */
function Services() {
  const { t } = useTranslation();

  useEffect(
    () => sendPageViewEvent("/services-selection", "Services Selection"),
    []
  );

  // Renders a link opening to ny.gov/services. Note that the Trans component
  // will still translate this text based on the given "i18nKey", but by
  // writing it out in the component, we can specify the link.
  const renderViewAllServicesSection = () => {
    return (
      <section>
        <Header as="h1">{t("services.everything.title")}</Header>
        <span data-testid="link-subtitle">
          <Trans i18nKey="services.everything.instructions">
            Visit
            <a
              href="https://ny.gov/services"
              className={markdown.external}
              target="_blank"
              rel="noopener noreferrer"
            >
              ny.gov/services
            </a>
            to view all New York State services.
          </Trans>
        </span>
        <Divider className={styles.divider} />
      </section>
    );
  };

  const matchingServiceKeys = _.values(
    useSelector(selectRankedMatchingServiceKeys)
  );
  const noFormulaServiceKeys = _.values(
    useSelector(selectRankedNoFormulaServiceKeys)
  );

  // Text for the additional services bucket depends on whether there are any
  // matching services.
  const additionalServicesTitle =
    matchingServiceKeys.length === 0
      ? t("services.default.title")
      : t("services.additional.title");
  const additionalServicesText =
    matchingServiceKeys.length === 0
      ? t("services.default.label")
      : t("services.additional.label");

  const selectedServices = useSelector(selectSelectedServices);

  return (
    <div className={styles.padded}>
      <SetTitle title={t("services.htmlTitle")} />
      {matchingServiceKeys.length > 0 && (
        <Fragment>
          <Bucket
            title={t("services.recommended.title", {
              count: matchingServiceKeys.length,
            })}
            additionalText={t("services.status.selectServices")}
            serviceKeys={matchingServiceKeys}
          />
          <Divider className={styles.divider} />
        </Fragment>
      )}

      {noFormulaServiceKeys.length > 0 && (
        <Fragment>
          <Bucket
            title={additionalServicesTitle}
            additionalText={additionalServicesText}
            serviceKeys={noFormulaServiceKeys}
            // Only collapse this Bucket when we have services that explicitly
            // match the user's answers. If we have no services to recommend,
            // this Bucket should expand by default.
            collapsible={matchingServiceKeys.length > 0}
          />
          <Divider className={styles.divider} />
        </Fragment>
      )}
      {renderViewAllServicesSection()}

      {matchingServiceKeys.length + noFormulaServiceKeys.length > 0 && (
        <SelectedServices serviceKeys={selectedServices} />
      )}
    </div>
  );
}

export default Services;
