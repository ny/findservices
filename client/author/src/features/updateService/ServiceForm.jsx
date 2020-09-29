import SingletonAccordion from "components/SingletonAccordion";
import styles from "features/updateService/UpdateService.module.css";
import markdown from "maslow-shared/src/components/Markdown.module.css";
import PropTypes from "prop-types";
import React from "react";
import { Trans, useTranslation } from "react-i18next";
import {
  Button,
  Checkbox,
  Divider,
  Form,
  Message,
  TextArea,
} from "semantic-ui-react";
import {
  renderTextarea,
  renderTextbox,
  visibilityMapper,
} from "utils/inputUtils";
import TranslationsTable from "./TranslationsTable";

/**
 * ServiceForm is a component that renders a form with fields for all service
 * details that can be entered and edited by content managers.
 */
function ServiceForm({
  serviceKey,
  onKeyChange,
  name,
  onNameChange,
  category,
  onCategoryChange,
  description,
  onDescChange,
  eligibility,
  onEligibilityChange,
  infoURL,
  onInfoURLChange,
  instructions,
  onInstructionsChange,
  appURL,
  onAppURLChange,
  preparation,
  onPrepChange,
  isServiceVisible,
  onVisibilityChange,
  markAllUpToDate,
  onUpToDateChange,
  formula,
  onFormulaChange,
  formulaError,
  formulaSuccess,
  questionKeys,
  onValidateClick,
  resourceVersions,
  isNew,
  showKeyError,
  showNameError,
  showCategoryError,
  showDescError,
  showInfoURLError,
  showAppURLError,
}) {
  const { t } = useTranslation();

  // Returns a form field for entering and validating a formula.
  const formulaField = () => {
    return (
      <Form.Field>
        <label>
          <strong>{t("updateService.formula.title")}</strong>
        </label>
        <small>{t("updateService.formula.description")}</small>
        <SingletonAccordion
          id="formula-guidelines"
          title={t("updateService.formula.guidelines.title")}
        >
          <small>
            <p>{t("updateService.formula.guidelines.introduction")}</p>
            <ul style={{ marginTop: 0 }}>
              <li>
                {t("updateService.formula.guidelines.equalSignRequirement")}
              </li>
              <li>
                {t("updateService.formula.guidelines.booleanRequirement")}
              </li>
              <li>
                <Trans i18nKey="updateService.formula.guidelines.functionRequirement">
                  The formula must only use{" "}
                  <strong>
                    <a
                      href="https://nysemail.sharepoint.com/:w:/t/ITS.365.Google.Fellows/EQMv3R3on4VDiV75PzuATDQBvN5581TCZlGD2ZZZtTPK1w?e=ew3o8h"
                      className={`${markdown.external}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      supported functions
                    </a>
                  </strong>
                </Trans>
              </li>
            </ul>
            <p className={styles.questionlist}>
              {t("updateService.formula.variables")}
            </p>
            <ul>
              {questionKeys.map((key) => (
                <li
                  key={key}
                  aria-label={`questionlist-${key}`}
                  className={styles.questionlist}
                >
                  {key}
                </li>
              ))}
            </ul>
          </small>
        </SingletonAccordion>
        <TextArea
          aria-label={t("updateService.formula.title")}
          error={(formulaError !== "").toString()}
          name={formula}
          value={formula}
          onChange={onFormulaChange}
        />
        {formulaSuccess !== "" && (
          <Message visible color="green" size="small" role="alert">
            {/* TODO: Change to positive once using default Semantic theme */}
            {formulaSuccess}
          </Message>
        )}
        {formulaError !== "" && (
          <Message visible error size="small" role="alert">
            {formulaError}
          </Message>
        )}
        <div className={`${styles.paddingtop} ${styles.paddingbottom}`}>
          <Button onClick={onValidateClick}>
            {t("updateService.formula.validate")}
          </Button>
        </div>
      </Form.Field>
    );
  };

  // TODO: Required fields are not displaying the red asterisk.
  return (
    <Form>
      <Form.Field>
        <label>
          <strong>{t("updateService.visibility.title")}</strong>
        </label>
        <small>{t("updateService.visibility.description")}</small>
        <Checkbox
          toggle
          className={styles.visibilityToggle}
          aria-label={t("updateService.visibility.title")}
          checked={isServiceVisible}
          onChange={onVisibilityChange}
        />
        <span className={styles.toggleLabel}>
          {t(visibilityMapper[isServiceVisible])}
        </span>
      </Form.Field>
      <Divider />
      {renderTextbox(
        t("updateService.serviceKey.title"),
        serviceKey,
        onKeyChange,
        isNew
          ? t("updateService.serviceKey.createDescription")
          : t("updateService.serviceKey.updateDescription"),
        true,
        !isNew,
        showKeyError,
        showKeyError ? t("updateService.serviceKey.error") : ""
      )}
      {renderTextbox(
        t("updateService.name.title"),
        name,
        onNameChange,
        null,
        true,
        false,
        showNameError,
        showNameError ? t("missingFieldError") : ""
      )}
      {renderTextbox(
        t("updateService.category.title"),
        category,
        onCategoryChange,
        null,
        true,
        false,
        showCategoryError,
        showCategoryError ? t("missingFieldError") : ""
      )}
      {renderTextarea(
        t("updateService.description.title"),
        description,
        onDescChange,
        t("updateService.description.description"),
        true,
        false,
        showDescError,
        showDescError ? t("missingFieldError") : ""
      )}
      {renderTextarea(
        t("updateService.eligibility.title"),
        eligibility,
        onEligibilityChange,
        <Trans i18nKey="updateService.eligibility.description">
          Use
          <a
            href="https://www.markdownguide.org/"
            className={markdown.external}
            target="_blank"
            rel="noopener noreferrer"
          >
            Markdown
          </a>
          if desired
        </Trans>,
        false
      )}
      {renderTextbox(
        t("updateService.infoURL.title"),
        infoURL,
        onInfoURLChange,
        t("updateService.infoURL.description"),
        true,
        false,
        showInfoURLError,
        showInfoURLError ? t("updateService.infoURL.error") : ""
      )}
      {renderTextarea(
        t("updateService.instructions.title"),
        instructions,
        onInstructionsChange,
        <Trans i18nKey="updateService.instructions.description">
          Use
          <a
            href="https://www.markdownguide.org/"
            className={markdown.external}
            target="_blank"
            rel="noopener noreferrer"
          >
            Markdown
          </a>
          if desired
        </Trans>,
        false
      )}
      {renderTextbox(
        t("updateService.appURL.title"),
        appURL,
        onAppURLChange,
        t("updateService.appURL.description"),
        false,
        false,
        showAppURLError,
        showAppURLError ? t("updateService.appURL.error") : ""
      )}
      {renderTextarea(
        t("updateService.preparation.title"),
        preparation,
        onPrepChange,
        <Trans i18nKey="updateService.preparation.description">
          Use
          <a
            href="https://www.markdownguide.org/"
            className={markdown.external}
            target="_blank"
            rel="noopener noreferrer"
          >
            Markdown
          </a>
          if desired
        </Trans>,
        false
      )}
      <Form.Field>
        <label>
          <strong>{t("updateService.translations.title")}</strong>
        </label>
        {isNew && t("updateService.translationMessage")}
        {!isNew && (
          <TranslationsTable
            serviceKey={serviceKey}
            resourceVersions={resourceVersions}
            onUpToDateChange={onUpToDateChange}
            markAllUpToDate={markAllUpToDate}
          />
        )}
      </Form.Field>
      {formulaField()}
    </Form>
  );
}

ServiceForm.propTypes = {
  /** Key of the service. */
  serviceKey: PropTypes.string,
  /** Function that should be executed if the key is updated in the form. */
  onKeyChange: PropTypes.func.isRequired,
  /** Name of the service. */
  name: PropTypes.string,
  /** Function that should be executed if the name is updated in the form. */
  onNameChange: PropTypes.func.isRequired,
  /** Category of the service. */
  category: PropTypes.string,
  /**
   * Function that should be executed if the category is updated in the form.
   */
  onCategoryChange: PropTypes.func.isRequired,
  /** Description of the service. */
  description: PropTypes.string,
  /**
   * Function that should be executed if the description is updated in the
   * form.
   */
  onDescChange: PropTypes.func.isRequired,
  /** Eligibility information for the service. */
  eligibility: PropTypes.string,
  /**
   * Function that should be executed if the eligibility information is updated
   * in the form.
   */
  onEligibilityChange: PropTypes.func.isRequired,
  /** Information URL for the service. */
  infoURL: PropTypes.string,
  /**
   * Function that should be executed if the information URL is updated in the
   * form.
   */
  onInfoURLChange: PropTypes.func.isRequired,
  /** Instructions for the service. */
  instructions: PropTypes.string,
  /**
   * Function that should be executed if the instructions are updated in the
   * form.
   */
  onInstructionsChange: PropTypes.func.isRequired,
  /** Application URL for the service. */
  appURL: PropTypes.string,
  /**
   * Function that should be executed if the application URL is updated in the
   * form.
   */
  onAppURLChange: PropTypes.func.isRequired,
  /** Preparation information for the service. */
  preparation: PropTypes.string,
  /**
   * Function that should be executed if the preparation information is updated
   * in the form.
   */
  onPrepChange: PropTypes.func.isRequired,
  /** Whether the service is visible/enabled. */
  isServiceVisible: PropTypes.bool,
  /**
   * Function that should be executed if the visibility is updated in the form.
   */
  onVisibilityChange: PropTypes.func.isRequired,
  /**
   * Boolean that indicates the checked status of the 'all up to date'
   * checkbox.
   */
  markAllUpToDate: PropTypes.bool.isRequired,
  /**
   * Function that should be executed if the checkbox indicating that all
   * translations should be marked up to date is clicked.
   */
  onUpToDateChange: PropTypes.func.isRequired,
  /** The eligibility formula for the service. */
  formula: PropTypes.string,
  /**
   * Function that should be executed if the formula is updated in the form.
   */
  onFormulaChange: PropTypes.func.isRequired,
  /** Error message after validating an invalid formula. */
  formulaError: PropTypes.string,
  /** Success message after validating a valid formula. */
  formulaSuccess: PropTypes.string,
  /** A list of the question keys that are available for use in the formula. */
  questionKeys: PropTypes.arrayOf(PropTypes.string).isRequired,
  /**
   * The function that should be executed about clicking the formula 'Validate'
   * button
   */
  onValidateClick: PropTypes.func.isRequired,
  /**
   * An object indicating the version of translations for each language.
   */
  resourceVersions: PropTypes.object.isRequired,
  /**
   * Indicates if the form is being rendered for a new service, as opposed to
   * for updating an existing one.
   */
  isNew: PropTypes.bool,
  /** Indicates if an error should be shown on the Service ID field. */
  showKeyError: PropTypes.bool,
  /** Indicates if an error should be shown on the Name field. */
  showNameError: PropTypes.bool,
  /** Indicates if an error should be shown on the Category field. */
  showCategoryError: PropTypes.bool,
  /** Indicates if an error should be shown on the Description field. */
  showDescError: PropTypes.bool,
  /** Indicates if an error should be shown on the Info URL field. */
  showInfoURLError: PropTypes.bool,
  /** Indicates if an error should be shown on the App URL field. */
  showAppURLError: PropTypes.bool,
};

ServiceForm.defaultProps = {
  /** By default, the form will render as if the service is existing. */
  isNew: false,
};

export default ServiceForm;
