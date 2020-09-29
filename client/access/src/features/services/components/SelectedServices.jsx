import { StickToBottom } from "components/StickToBottom";
import PropTypes from "prop-types";
import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Button } from "semantic-ui-react";

/**
 * Renders a panel that indicates the number of services selected and links to
 * the Report.
 */
export default function SelectedServices({ serviceKeys }) {
  const { t } = useTranslation();
  const isSelectionEmpty = serviceKeys.length === 0;

  return (
    <span role="status">
      {!isSelectionEmpty && (
        <StickToBottom>
          <Link
            to={`/app/list?services=${serviceKeys.join(",")}`}
            tabIndex={-1}
          >
            <Button primary fluid>
              {t(`services.actions.viewSaved`, {
                count: serviceKeys.length,
              })}
            </Button>
          </Link>
        </StickToBottom>
      )}
    </span>
  );
}

SelectedServices.propTypes = {
  /** An array of the identifiers of the selected services. */
  serviceKeys: PropTypes.arrayOf(PropTypes.string).isRequired,
};
