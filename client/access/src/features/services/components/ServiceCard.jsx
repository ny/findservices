import { Expando, Markdown } from "maslow-shared";
import {
  selectReport,
  toggleAddedToReport,
} from "features/report/slices/reportSlice";
import styles from "features/services/components/ServiceCard.module.css";
import PropTypes from "prop-types";
import React from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { Button, Card, Icon, Label } from "semantic-ui-react";
import { sendServiceEvent } from "util/analytics";

/**
 * Renders a card representing an individual service, including a header,
 * category, short description, an expandable accordion with additional
 * information and a button to toggle whether the service is saved to the
 * report.
 */
export function ServiceCard({ serviceKey }) {
  const MAX_CONTENT_HEIGHT_IN_PX = 150;
  const { t, i18n } = useTranslation();

  const isAddedToReport = useSelector(selectReport)[serviceKey];
  const dispatch = useDispatch();

  // Display the toggle button to add/remove the service to/from the report.
  const renderButtonContent = () => {
    const text = isAddedToReport
      ? t("services.actions.removeFromList")
      : t("services.actions.addToList");
    return (
      <>
        <Icon name={isAddedToReport ? "minus" : "plus"} />
        {text}
      </>
    );
  };

  // Toggle whether the service is included in the report and log an event to
  // Analytics with the English name of the service.
  const handleButtonClick = () => {
    dispatch(toggleAddedToReport(serviceKey));
    const serviceName = i18n.getResource("en", "catalog", `${serviceKey}.name`);
    const eventName = isAddedToReport ? "removeFromList" : "addToList";
    sendServiceEvent(eventName, serviceName);
  };

  return (
    <Card fluid>
      <Card.Content>
        <Card.Meta>
          <Label aria-hidden={true} className={styles.category}>
            {t(`catalog:${serviceKey}.category`)}
          </Label>
        </Card.Meta>
        <Card.Header as="h2">{t(`catalog:${serviceKey}.name`)}</Card.Header>
        <small className={styles.srOnly}>
          {`${t("services.info.category")}: ${t(
            `catalog:${serviceKey}.category`
          )}`}
        </small>
        <Expando maxHeight={MAX_CONTENT_HEIGHT_IN_PX}>
          <Card.Description>
            <p>{t(`catalog:${serviceKey}.description`)}</p>
            {i18n.exists(`catalog:${serviceKey}.eligibility`) && (
              <section>
                <h3>{t("services.info.criteria")}</h3>
                <Markdown>{t(`catalog:${serviceKey}.eligibility`)}</Markdown>
              </section>
            )}
          </Card.Description>
        </Expando>
        <div className={styles.actionArea}>
          <Button
            fluid
            toggle
            active={isAddedToReport}
            onClick={handleButtonClick}
          >
            {renderButtonContent()}
          </Button>
        </div>
      </Card.Content>
    </Card>
  );
}

ServiceCard.propTypes = {
  /** A unique identifier for the service to be rendered. */
  serviceKey: PropTypes.string.isRequired,
};
