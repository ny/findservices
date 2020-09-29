import React from "react";
import { useTranslation } from "react-i18next";
import { Header, Button, Modal, Icon } from "semantic-ui-react";
import PropTypes from "prop-types";

/**
 * SubmissionModal is a component that renders a modal asking the user to
 * confirm whether to save changes to a service.
 */
function SubmissionModal({ open, onClose, onConfirm }) {
  const { t } = useTranslation();

  return (
    <Modal basic onClose={onClose} open={open}>
      <Header as="h2">{t("updateService.confirmChanges")}</Header>
      <Modal.Content>
        <p>{t("updateService.submissionWarning")}</p>
      </Modal.Content>
      <Modal.Actions>
        <Button basic color="red" inverted onClick={onClose}>
          <Icon name="remove" />
          {t("updateService.no")}
        </Button>
        <Button color="green" inverted onClick={onConfirm}>
          <Icon name="checkmark" />
          {t("updateService.yes")}
        </Button>
      </Modal.Actions>
    </Modal>
  );
}

SubmissionModal.propTypes = {
  /** Boolean value indicating if the modal should be open. */
  open: PropTypes.bool.isRequired,
  /** Function that should be executed when the modal is closed. */
  onClose: PropTypes.func.isRequired,
  /**
   * Function that should be executed if the confirmation action on the modal
   * is clicked.
   */
  onConfirm: PropTypes.func.isRequired,
};

export default SubmissionModal;
