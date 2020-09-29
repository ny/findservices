import i18next from "i18next";
import _ from "lodash";
import PropTypes from "prop-types";
import React from "react";
import { useTranslation } from "react-i18next";
import { Card, Label } from "semantic-ui-react";
import { Expando } from "./Expando";
import { Markdown } from "./Markdown";
import markdown from "./Markdown.module.css";
import styles from "./ReportCard.module.css";

/**
 * Represents an individual service.
 * Displays a header, short description, information link, and optionally an
 * application link and list of items needed to apply with.
 * Shortens the displayed text with an option to see more if the text is too
 * long.
 */
export function ReportCard({ service, learnMoreOnClick, expanded, lng }) {
  const { i18n } = useTranslation();
  const t = i18n.getFixedT(lng);

  // TODO: Use lng prop to show the i18n keys in the provided language.
  const MAX_CONTENT_HEIGHT_IN_PX = 150;
  return (
    <Card fluid>
      <Card.Content>
        {!_.isEmpty(service.category) && (
          <Card.Meta>
            <Label aria-hidden={true} className={styles.category}>
              {service.category}
            </Label>
          </Card.Meta>
        )}
        {!_.isEmpty(service.name) && (
          <Card.Header as="h2">{service.name}</Card.Header>
        )}
        <small className={styles.srOnly}>
          {`${t("services.info.category")}: ${service.category}`}
        </small>
        <Expando
          maxHeight={MAX_CONTENT_HEIGHT_IN_PX}
          defaultExpanded={expanded}
          lng={lng}
        >
          <Card.Description>
            <section>
              <p>{service.description}</p>
              {!_.isEmpty(service.informationUrl) && (
                <p>
                  <a
                    href={service.informationUrl}
                    className={`${markdown.external} ${styles.anchor}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={learnMoreOnClick}
                  >
                    {t("report.learnMore")}
                  </a>
                </p>
              )}
            </section>
            {!_.isEmpty(service.instructions) && (
              <section>
                <div>
                  <strong>{t("report.apply.ready")}</strong>
                  <Markdown source={service.instructions} />
                </div>
              </section>
            )}
            <section>
              {!_.isEmpty(service.applicationUrl) && (
                <p>
                  <a
                    href={service.applicationUrl}
                    className={`${markdown.external} ${styles.anchor}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {t("report.apply.howTo")}
                  </a>
                </p>
              )}
            </section>
            {!_.isEmpty(service.preparation) && (
              <section>
                <strong>{t("report.apply.need")}</strong>
                <Markdown source={service.preparation} />
              </section>
            )}
            {!_.isEmpty(service.eligibility) && (
              <section>
                <strong>{t("report.apply.criteria")}</strong>
                <Markdown source={service.eligibility} />
              </section>
            )}
          </Card.Description>
        </Expando>
      </Card.Content>
    </Card>
  );
}

ReportCard.propTypes = {
  /**
   * An object including the details of the service to be rendered.
   */
  service: PropTypes.shape({
    /** The name of the service. */
    name: PropTypes.string,
    /** The category of the service. */
    category: PropTypes.string,
    /** The description of the service. */
    description: PropTypes.string,
    /** The URL for information about the service. */
    informationUrl: PropTypes.string,
    /** The URL for applying to the service. */
    applicationUrl: PropTypes.string,
    /** The instructions for how to apply to the service. */
    instructions: PropTypes.string,
    /** The ways to prepare for applying to the service. */
    preparation: PropTypes.string,
    /** Additional eligibility criteria for the service. */
    eligibility: PropTypes.string,
  }).isRequired,
  /* A callback that fires when the user clicks the "Learn More" link. */
  learnMoreOnClick: PropTypes.func,
  /* Show the card as expanded (it is collapsed by default) */
  expanded: PropTypes.bool,
  /* A string representing the language that should be used. */
  lng: PropTypes.string,
};

ReportCard.defaultProps = {
  learnMoreOnClick: () => {}, // Intentional no-op as default
  expanded: false,
  lng: i18next.language,
};
