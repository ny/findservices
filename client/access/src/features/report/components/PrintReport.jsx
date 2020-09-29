import SetTitle from "components/SetTitle";
import "core-js/features/url-search-params";
import styles from "features/report/components/PrintReport.module.css";
import { selectServices } from "features/services/slices/servicesSlice";
import { Markdown } from "maslow-shared";
import React, { useEffect, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { Redirect } from "react-router";
import { useLocation } from "react-router-dom";

/**
 * Displays all available information for a user's selected social services,
 * in a printer friendly format.
 */
export default function PrintReport() {
  const { t, i18n } = useTranslation();
  const services = useSelector(selectServices);
  const urlParams = useLocation().search;
  const [footnoteNums, setFootnoteNums] = useState({});

  const parsedParams = new URLSearchParams(urlParams).get("services");
  const possibleServiceKeys = parsedParams ? parsedParams.split(",") : [];
  const allServiceKeys = Object.keys(services);
  const [selectedServiceKeys] = useState(
    possibleServiceKeys.filter((key) => allServiceKeys.includes(key))
  );

  // Finds links for the different services (each service has 1-2 links) and
  // creates an object with the service key as the key, and an object
  // indicating the footenote number for each link as the value. This object is
  // used to set the footnoteNums state.
  useEffect(() => {
    const footnoteData = {};
    let currentNum = 1;
    if (!services) {
      return;
    }
    selectedServiceKeys.forEach((key) => {
      const service = services[key];
      footnoteData[key] = {};
      if (service.informationUrl) {
        footnoteData[key].informationUrl = currentNum;
        currentNum++;
      }
      if (service.applicationUrl) {
        footnoteData[key].applicationUrl = currentNum;
        currentNum++;
      }
    });
    setFootnoteNums(footnoteData);
  }, [selectedServiceKeys, services]);

  // Renders the information, including footnotes, for a given service.
  const renderServiceData = (serviceKey) => {
    const service = services[serviceKey];
    return (
      <section key={serviceKey}>
        {!!footnoteNums[serviceKey] && (
          <section>
            <h2>{t(`catalog:${serviceKey}.name`)}</h2>
            <p>{t(`catalog:${serviceKey}.description`)}</p>
            {!!service.informationUrl && (
              <p data-testid="learnMore">
                {t("report.learnMore")}
                <sup>{footnoteNums[serviceKey].informationUrl}</sup>
              </p>
            )}
            {i18n.exists(`catalog:${serviceKey}.instructions`) && (
              <span data-testid="applicationInstructions">
                <strong>{t("report.apply.ready")}</strong>
                <Markdown source={t(`catalog:${serviceKey}.instructions`)} />
              </span>
            )}
            {!!service.applicationUrl && (
              <p data-testid="howToApply">
                {t("report.apply.howTo")}
                <sup>{footnoteNums[serviceKey].applicationUrl}</sup>
              </p>
            )}
            {i18n.exists(`catalog:${serviceKey}.preparation`) && (
              <span data-testid="needToApply">
                <strong>{t("report.apply.need")}</strong>
                <Markdown source={t(`catalog:${serviceKey}.preparation`)} />
              </span>
            )}
          </section>
        )}
      </section>
    );
  };

  // Renders a list of footnotes.
  const renderFootnotes = () => {
    const footnotes = [];
    Object.keys(footnoteNums).forEach((key) => {
      if (footnoteNums[key].informationUrl) {
        footnotes.push(services[key].informationUrl);
      }
      if (footnoteNums[key].applicationUrl) {
        footnotes.push(services[key].applicationUrl);
      }
    });

    return (
      <ol className={styles.footnoteDefinition}>
        {footnotes.map((footnote, index) => (
          <li key={index}>{footnote}</li>
        ))}
      </ol>
    );
  };

  // Renders the entire page with information about all selected services and
  // footnotes at the bottom.
  const render = () => {
    if (!!services && selectedServiceKeys.length === 0) {
      return <Redirect to="/app/services" />;
    }
    return (
      <main>
        <SetTitle title={t("print.htmlTitle")} />
        {/* TODO: Add a screen-reader only visible element prompting the user to
        print the page? */}
        {!!services && (
          <div>
            <h1>{t("report.title")}</h1>
            {selectedServiceKeys.map((key) => renderServiceData(key))}
            <section className={styles.message}>
              <Trans i18nKey="report.message.disclaimer" />
              <Trans i18nKey="report.message.disclaimerLink_print" />
            </section>
            <hr />
            {renderFootnotes()}
          </div>
        )}
      </main>
    );
  };

  return render();
}
