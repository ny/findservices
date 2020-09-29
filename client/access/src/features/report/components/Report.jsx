import SetTitle from "components/SetTitle";
import "core-js/features/url-search-params";
import styles from "features/report/components/Report.module.css";
import {
  selectServices,
  selectRank,
} from "features/services/slices/servicesSlice";
import _ from "lodash";
import { ReportCard } from "maslow-shared";
import markdown from "maslow-shared/src/components/Markdown.module.css";
import React, { Fragment, useEffect, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import { Button, Grid, Header, Icon, Message } from "semantic-ui-react";
import { sendEvent, sendPageViewEvent, sendServiceEvent } from "util/analytics";

/**
 * Displays all available information for a user's selected social services,
 * providing a focused list of services for residents to apply to receive.
 *
 * This component expects selected services to be encoded in the URL path, which
 * allows the user to bookmark their list and return to it at a later time. The
 * URL is expected to be formatted with the following, comma separated
 * `services` parameter:
 *
 * http(s)://{host}/app/list?services=KEY_1,KEY_2,KEY_3
 */
export default function Report() {
  useEffect(() => sendPageViewEvent("/services-list", "Services List"), []);

  const { t, i18n } = useTranslation();
  const services = useSelector(selectServices);
  const rank = useSelector(selectRank);
  const urlParams = useLocation().search;
  const [selectedServiceKeys, setSelectedServiceKeys] = useState([]);
  const [allKeysValid, setAllKeysValid] = useState(false);

  // Validates that the URL parameters have corresponding service keys in Redux,
  // removing any parameters that do not.
  const validateParams = () => {
    const parsedParams = new URLSearchParams(urlParams).get("services");
    const possibleServiceKeys = parsedParams ? parsedParams.split(",") : [];
    const allServiceKeys = Object.keys(services);

    if (_.isEmpty(possibleServiceKeys)) {
      setAllKeysValid(false);
      setSelectedServiceKeys([]);
      return;
    }

    setAllKeysValid(
      possibleServiceKeys.every((key) => allServiceKeys.includes(key))
    );

    const validServiceKeys = possibleServiceKeys.filter((key) =>
      allServiceKeys.includes(key)
    );
    setSelectedServiceKeys(
      rank.filter((key) => validServiceKeys.includes(key))
    );
  };

  // Validation logic has side effects (modifying the list of service keys), so
  // it must occur before the component renders.
  useEffect(validateParams, [urlParams, services]);

  // Initiates a share action, sharing the current URL.
  const handleShare = async () => {
    if (navigator.share) {
      const reportUrl = window.location.href;
      await navigator
        .share({
          title: t("report.share.subject"),
          text: t("report.share.text"),
          url: reportUrl,
        })
        .then(() => sendEvent("share"))
        .catch((reason) => {
          console.log("Error occurred while sharing: " + reason);
        });
    } else {
      console.log("Error: sharing is not supported in this browser");
    }
  };

  // Initiates an email action, including the current URL within the body of the
  // email.
  const handleEmail = () => {
    const emailSubject = t("report.share.subject");
    const emailBody = t("report.share.body", {
      reportUrl: encodeURIComponent(window.location.href),
    });
    window.location.assign(
      "mailto:?subject=" + emailSubject + "&body=" + emailBody
    );
    sendEvent("email");
  };

  // Sends an event to Google Analytics indicating the resident clicked the
  // Print button.
  const handlePrint = () => {
    sendEvent("print");
  };

  // Renders a button to support sharing the URL of the current page, which is
  // a "Share services" button if sharing is supported in the current browser;
  // otherwise, an "Email services" button is rendered.
  const renderShareButton = () => {
    if (navigator.share) {
      return (
        <Button onClick={handleShare} primary fluid icon>
          <Icon className="spacing" name="share alternate" />
          {t("report.actions.share")}
        </Button>
      );
    } else {
      return (
        <Button
          aria-label={t("report.share.emailLabel")}
          onClick={handleEmail}
          primary
          fluid
          icon
        >
          <Icon className="spacing" name="envelope" />
          {t("report.actions.email")}
        </Button>
      );
    }
  };

  // Renders a button to support printing the current page. Sends the user to a
  // printer-friendly version of the Report.
  const renderPrintButton = () => {
    return (
      <Link
        to={`/app/list/print?services=${selectedServiceKeys.join(",")}`}
        tabIndex={-1}
      >
        <Button onClick={handlePrint} primary fluid icon>
          <Icon className="spacing" name="print" />
          {t("report.actions.print")}
        </Button>
      </Link>
    );
  };

  // Renders the correct combination of share/email & print buttons.
  const renderButtons = () => {
    return (
      <Grid>
        <Grid.Column width={8}>{renderShareButton()}</Grid.Column>
        <Grid.Column width={8}>{renderPrintButton()}</Grid.Column>
      </Grid>
    );
  };

  // Renders a warning when services from the URL are no longer available.
  const renderMissingServicesWarning = () => {
    return (
      <Message color="orange" className={styles.message}>
        <Icon
          aria-hidden="true"
          className={`orange ${styles.messageIcon}`}
          size="small"
          name="info"
          circular
        />
        <Message.Content role="alert" className={styles.messageContent}>
          <Trans i18nKey="report.message.servicesRemoved">
            Since your last visit some services have been removed from this
            list. You can always{" "}
            <strong>
              <Link to="/app/survey">start over</Link>
            </strong>
            .
          </Trans>
        </Message.Content>
      </Message>
    );
  };

  const renderNoServicesMessage = () => {
    return (
      <Fragment>
        <SetTitle title={t("report.error.htmlTitle")} />
        <Header as="h1" id="report-error-header">
          {t("report.error.title")}
        </Header>
        <section aria-labelledby="report-error-header">
          <p>{t("report.error.instructions")}</p>
          <Link to="/app/survey">
            <Button fluid primary tabIndex={-1}>
              {t("report.actions.startOver")}
            </Button>
          </Link>
        </section>
      </Fragment>
    );
  };

  // Returns a thunk intended to be fired when the user clicks the "Learn more"
  // link in the ReportCard. Logs an analytics event when called.
  const learnMoreCallback = (serviceKey) => () => {
    const serviceName = i18n.getResource("en", "catalog", `${serviceKey}.name`);
    sendServiceEvent("learnMore", serviceName);
  };

  // Renders the services that are part of the Report. Renders share/email
  // services and print services buttons.
  const render = () => {
    if (!services) {
      return null;
    } else if (_.isEmpty(selectedServiceKeys)) {
      return renderNoServicesMessage();
    }
    const servicesWithTranslations = selectedServiceKeys.map((key) => {
      const newService = Object.assign({}, services[key], {
        // Required keys.
        key: key,
        category: t(`catalog:${key}.category`),
        name: t(`catalog:${key}.name`),
        // Optional keys (may not exist depending on the service).
        ...(i18n.exists(`catalog:${key}.description`) && {
          description: t(`catalog:${key}.description`),
        }),
        ...(i18n.exists(`catalog:${key}.instructions`) && {
          instructions: t(`catalog:${key}.instructions`),
        }),
        ...(i18n.exists(`catalog:${key}.preparation`) && {
          preparation: t(`catalog:${key}.preparation`),
        }),
        ...(i18n.exists(`catalog:${key}.eligibility`) && {
          eligibility: t(`catalog:${key}.eligibility`),
        }),
      });
      return newService;
    });
    return (
      <Fragment>
        <SetTitle title={t("report.htmlTitle")} />
        <Header as="h1">{t("report.title")}</Header>
        <p>{t("report.recommend")}</p>
        {renderButtons()}
        {!allKeysValid && renderMissingServicesWarning()}
        {servicesWithTranslations.map((service) => (
          <ReportCard
            key={service.key}
            service={service}
            learnMoreOnClick={learnMoreCallback(service.key)}
          />
        ))}
        <Message className={styles.message}>
          <Trans i18nKey="report.message.disclaimer" />
          <Trans i18nKey="report.message.disclaimerLink">
            Visit the
            <a
              href="https://ny.gov/services"
              className={markdown.external}
              target="_blank"
              rel="noopener noreferrer"
            >
              Services page
            </a>
            to view all New York State services.
          </Trans>
        </Message>
      </Fragment>
    );
  };

  return render();
}
