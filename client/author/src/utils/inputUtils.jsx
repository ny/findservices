import React from "react";
import { Form, Input, Message, TextArea } from "semantic-ui-react";
import _ from "lodash";
import styles from "utils/inputUtils.module.css";

// Render a textbox field in the form.
const renderTextbox = (
  title,
  value,
  handleChange,
  description,
  required,
  readOnly = false,
  error = false,
  errorMessage = ""
) => {
  return (
    <Form.Field required={required}>
      <label>
        <strong>{title}</strong>
      </label>
      {!_.isEmpty(description) ? <small>{description}</small> : null}
      <Input
        className={styles.translationField}
        readOnly={readOnly}
        aria-label={title}
        name={value}
        value={value}
        onChange={handleChange}
        error={error}
      />
      {error && (
        <Message visible error size="small" role="alert">
          {errorMessage}
        </Message>
      )}
    </Form.Field>
  );
};

// Render a textarea field in the form.
const renderTextarea = (
  title,
  value,
  handleChange,
  description,
  required,
  readOnly = false,
  error = false,
  errorMessage = ""
) => {
  return (
    <Form.Field required={required}>
      <label>
        <strong>{title}</strong>
      </label>
      {!_.isEmpty(description) ? <small>{description}</small> : null}
      <TextArea
        className={styles.translationField}
        aria-label={title}
        name={value}
        value={value}
        onChange={handleChange}
        error={error.toString()}
        readOnly={readOnly}
      />
      {error && (
        <Message visible error size="small" role="alert">
          {errorMessage}
        </Message>
      )}
    </Form.Field>
  );
};

// Renders a message if one exists. If there is an error message from failing
// to save changes, render that. If not, if there is a positive update
// message from saving translations, render that. Never render both.
const renderMessage = (errorMessage, updateMessage, dismissed, onDismiss) => {
  let positive = undefined;
  let negative = true;
  let message = "";
  if (!_.isEmpty(errorMessage)) {
    message = errorMessage;
  } else if (!_.isEmpty(updateMessage)) {
    positive = true;
    negative = undefined;
    message = updateMessage;
  }

  if (!_.isEmpty(message) && !dismissed) {
    return (
      <Message
        role="status"
        positive={positive}
        negative={negative}
        onDismiss={onDismiss}
      >
        {message}
      </Message>
    );
  }
  return;
};

// Map of locales to language names.
const localeToLanguageMap = {
  bn: "Bengali",
  en: "English",
  es: "Spanish",
  ht: "Haitian Creole",
  ko: "Korean",
  ru: "Russian",
  zh: "Chinese",
};

// Function that returns language for a locale.
function getLanguageForLocale(locale) {
  return localeToLanguageMap[locale];
}

// Function to map custom error messages to a i18n key for a client-facing error
// message.
const httpErrorStatusToMessageKey = (message, isLocalePage, isOnSave) => {
  if (_.isEmpty(message)) {
    message = "";
  }

  const errorCodeRegexp = /^([A-Z_]+):/;
  const matches = message.match(errorCodeRegexp);
  let errCode = "";
  if (matches && matches.length >= 2) {
    errCode = matches[1];
  } else if (message.startsWith("Validation failed")) {
    errCode = "VALIDATION_FAILED";
  }

  switch (errCode) {
    case "CONCURRENT_EDIT":
      return "httpError.concurrentEdit";
    case "RESOURCE_NOT_FOUND":
      return ""; // This is returned when a language has not yet been translated. This is expected, and should not be treated as an error.
    case "SERVICE_NOT_FOUND":
      if (isLocalePage) {
        return "httpError.missingServiceForLocale";
      }
      return "httpError.missingService";
    case "SERVICE_NOT_UNIQUE":
      return "httpError.duplicateID";
    case "VALIDATION_FAILED":
      return "httpError.validationFailed";
    // TODO: Consider adding a i18n key for an error message on 403 errors once
    // security is in place.
    default:
      if (isOnSave) {
        return "httpError.saveFailed";
      }
      return "httpError.generic";
  }
};

// visibilityMapper stores the mappings from boolean "enabled" value to the
// i18n key that should be used to show the text on the UI.
const visibilityMapper = {
  true: "manageServices.visible",
  false: "manageServices.hidden",
};

export {
  getLanguageForLocale,
  renderTextarea,
  renderTextbox,
  localeToLanguageMap,
  httpErrorStatusToMessageKey,
  renderMessage,
  visibilityMapper,
};
