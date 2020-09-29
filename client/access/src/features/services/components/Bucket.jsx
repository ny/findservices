import { ServiceCard } from "features/services/components/ServiceCard";
import styles from "features/services/components/Services.module.css";
import PropTypes from "prop-types";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Header, Icon } from "semantic-ui-react";

/**
 * Renders a list of service cards according to the specified serviceKeys,
 * labeled with a title and additional text.
 */
function Bucket({ title, additionalText, serviceKeys, collapsible }) {
  const { t } = useTranslation();
  const [isCollapsed, setIsCollapsed] = useState(collapsible);

  const toggleCollapsed = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <section>
      <Header as="h1" className={styles.bucketHeader}>
        {title}
      </Header>
      <p>{additionalText}</p>
      {collapsible && (
        <Button fluid onClick={toggleCollapsed}>
          <Icon name={isCollapsed ? "chevron down" : "chevron up"} />
          {isCollapsed
            ? t("services.actions.seeMoreServices", {
                count: serviceKeys.length,
              })
            : t("services.actions.hideMoreServices", {
                count: serviceKeys.length,
              })}
        </Button>
      )}
      {!isCollapsed &&
        serviceKeys.map((key) => {
          return <ServiceCard key={key} serviceKey={key} />;
        })}
    </section>
  );
}

Bucket.propTypes = {
  /** The title of the bucket. */
  title: PropTypes.string.isRequired,
  /** The subtitle of the bucket. */
  additionalText: PropTypes.string,
  /**
   * An array of service keys indicating which services should be displayed in
   * the bucket.
   */
  serviceKeys: PropTypes.array,
  /** Indicates whether the bucket can be toggled open and closed. */
  collapsible: PropTypes.bool,
};

Bucket.defaultProps = {
  additionalText: "",
  serviceKeys: [],
  collapsible: false,
};

export default Bucket;
