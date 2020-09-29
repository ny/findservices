import React, { Fragment, useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Header,
  Grid,
  Container,
  Breadcrumb,
  Segment,
  Button,
} from "semantic-ui-react";
import axios from "axios";
import { useLocation, Link, useHistory, useParams } from "react-router-dom";
import { evaluate, ReportCard } from "maslow-shared";
import _ from "lodash";
import styles from "features/updateService/UpdateService.module.css";
import ServiceForm from "features/updateService/ServiceForm";
import PropTypes from "prop-types";
import HttpError from "components/HttpError";
import { httpErrorStatusToMessageKey, renderMessage } from "utils/inputUtils";
import SubmissionModal from "features/updateService/SubmissionModal";
import { useOktaAuth } from "@okta/okta-react";
import { setAuthToken } from "auth/setAuthToken";

/**
 * UpdateService is a component for creating a new service, or updating an
 * existing service, in the Author UI.
 * Content managers can provide or update the service details.
 */
function UpdateService({ isNew }) {
  const { t } = useTranslation();
  const history = useHistory();
  const location = useLocation();
  const params = useParams();

  const { authState } = useOktaAuth();
  // These two regular expressions must match those on the server.
  const urlRegexp = /^(https?:\/\/[^\s$.?#].[^\s]*)?$/;
  const serviceKeyRegexp = /^[A-Z][A-Z0-9_]+$/;

  let serviceKey = "";
  if (!isNew && location.pathname.includes("update")) {
    serviceKey = params.id;
  }

  const [serviceETag, setServiceETag] = useState();
  const [serviceDetails, setServiceDetails] = useState({});
  const [key, setKey] = useState(serviceKey);
  const [validKey, setvalidKey] = useState(isNew ? false : true);
  const [name, setName] = useState("");
  const [validName, setValidName] = useState(isNew ? false : true);
  const [category, setCategory] = useState("");
  const [validCategory, setValidCategory] = useState(isNew ? false : true);
  const [description, setDescription] = useState("");
  const [validDesc, setValidDesc] = useState(isNew ? false : true);
  const [eligibility, setEligibility] = useState("");
  const [infoURL, setInfoURL] = useState("");
  const [validInfoURL, setValidInfoURL] = useState(isNew ? false : true);
  const [instructions, setInstructions] = useState("");
  const [appURL, setAppURL] = useState("");
  const [validAppURL, setValidAppURL] = useState(true);
  const [preparation, setPreparation] = useState("");
  const [isServiceVisible, setIsServiceVisible] = useState(false);
  const [formula, setFormula] = useState("");
  const [formulaError, setFormulaError] = useState("");
  const [formulaSuccess, setFormulaSuccess] = useState("");
  const [questionKeys, setQuestionKeys] = useState([]);
  const [markAllUpToDate, setMarkAllUpToDate] = useState(false);

  const [dismissed, setDismissed] = useState(false);
  const [updateMessage] = useState(_.get(location, "state.updateMessage", ""));
  const [validationErrorOnSubmit, setValidationErrorOnSubmit] = useState(false);
  const [apiErrorOnSubmitMessage, setApiErrorOnSubmitMessage] = useState("");
  const [apiErrorOnGetMessage, setApiErrorOnGetMessage] = useState("");

  const [showModal, setShowModal] = useState(false);

  // Retrieves service data from API. Only called when updating an existing
  // service.
  const fetchServiceData = useCallback(async () => {
    if (_.isEmpty(key)) {
      // Should never happen besides in testing when history.push does not
      // actually switch Routes.
      console.log("Fetch data called with empty service key");
      return;
    }

    try {
      // set default http requests to have Bearer accessToken in Authorization Header
      const accessToken = authState.accessToken;
      setAuthToken(accessToken);
      const serviceResp = await axios.get(`/api/author/v1/services/${key}`);
      setServiceETag(_.get(serviceResp, "headers.etag", ""));

      const service = serviceResp.data;
      const englishStrings = service.resources.en;
      setName(englishStrings.name);
      setCategory(englishStrings.category);
      setDescription(englishStrings.description);
      setEligibility(englishStrings.eligibility);
      setInfoURL(service.informationUrl);
      setInstructions(englishStrings.instructions);
      setAppURL(service.applicationUrl);
      setPreparation(englishStrings.preparation);
      setIsServiceVisible(service.enabled);
      setFormula(service.formula);
      setServiceDetails(service);
    } catch (err) {
      console.error(err);
      let message = "";
      if (!_.isEmpty(err.response) && !_.isEmpty(err.response.data)) {
        message = err.response.data.message;
      }
      const errMsgKey = httpErrorStatusToMessageKey(message, false, false);
      setApiErrorOnGetMessage(errMsgKey);
    }
  }, [
    setName,
    setCategory,
    setDescription,
    setEligibility,
    setInfoURL,
    setInstructions,
    setAppURL,
    setPreparation,
    setIsServiceVisible,
    setFormula,
    setServiceDetails,
    setApiErrorOnGetMessage,
    key,
    authState,
  ]);

  // Retrieves question key data from API.
  const fetchQuestionKeys = useCallback(async () => {
    try {
      const questionKeyResp = await axios.get(
        "/api/author/v1/lookup/questions"
      );
      setQuestionKeys(questionKeyResp.data);
    } catch (err) {
      setApiErrorOnGetMessage("httpError.generic");
    }
  }, [setQuestionKeys, setApiErrorOnGetMessage]);

  useEffect(() => {
    fetchQuestionKeys();
  }, [fetchQuestionKeys]);

  // Retrieves data for the given service from the API and sets state.
  useEffect(() => {
    if (!isNew) {
      // For an existing service, get information about the service and set
      // state.
      fetchServiceData();
    }
  }, [fetchServiceData, isNew]);

  // Run formula validation on validate button click.
  const onValidateClick = (shouldReturnErr = false) => {
    setFormulaSuccess("");
    setFormulaError("");
    const err = checkFormulaValidity();
    if (err == null) {
      setFormulaSuccess(t("updateService.formula.success"));
    } else {
      setFormulaError(err.message);
    }
    if (shouldReturnErr) {
      return err;
    }
  };

  // Checks the validity of the provided formula.
  const checkFormulaValidity = () => {
    try {
      const sampleAnswers = {};
      questionKeys.forEach((key) => {
        sampleAnswers[key] = "";
      });
      if (!_.isEmpty(_.trim(formula))) {
        evaluate(_.trim(formula), sampleAnswers);
      }
    } catch (err) {
      return err;
    }
    return;
  };

  // Handle content manager saving changes to a service.
  const onSave = async () => {
    if (!formTrimmedInputIsValid()) {
      setValidationErrorOnSubmit(true);
      return;
    }
    if (isServiceVisible) {
      setShowModal(true);
      return;
    }
    // Send updates to API.
    sendUpdates();
  };

  // Check validity of form fields. Trim fields before validation, if
  // necessary.
  const formTrimmedInputIsValid = () => {
    // Fields that are checked against regular expressions and do not allow
    // empty spaces (key, infoURL, appURL) are trimmed as they are entered, and
    // do not need to be trimmed again to check validity.

    // Trim and revalidate required fields.
    const trimmedName = _.trim(name);
    setName(trimmedName);
    setValidName(!_.isEmpty(trimmedName));
    const trimmedDescription = _.trim(description);
    setDescription(trimmedDescription);
    setValidDesc(!_.isEmpty(trimmedDescription));
    const trimmedCategory = _.trim(category);
    setCategory(trimmedCategory);
    setValidCategory(!_.isEmpty(trimmedCategory));

    // Trim non-required fields.
    eligibility && setEligibility(_.trim(eligibility));
    instructions && setInstructions(_.trim(instructions));
    preparation && setPreparation(_.trim(preparation));

    const formulaErr = onValidateClick(true);
    return (
      validKey &&
      validInfoURL &&
      validAppURL &&
      // Check emptiness of required fields again vs. using the state variables
      // directly, since state variables will not be updated unless there is a
      // re-render.
      !_.isEmpty(trimmedName) &&
      !_.isEmpty(trimmedDescription) &&
      !_.isEmpty(trimmedCategory) &&
      !formulaErr
    );
  };

  // Send service updates to backend and handle any errors in doing so.
  const sendUpdates = async () => {
    // Send updates to API.
    const newServiceDetails = getCurrentServiceDetails(false);
    try {
      if (isNew) {
        await axios.post("/api/author/v1/services", newServiceDetails);
      } else {
        await axios.put(`/api/author/v1/services/${key}`, newServiceDetails, {
          headers: { "If-Match": serviceETag },
        });
        if (markAllUpToDate) {
          await axios.post(`/api/author/v1/services/${key}/locales:update`);
        }
      }
      history.push({
        pathname: "/app/services",
        state: {
          updateMessage: t("manageServices.saveMessage", {
            service: name,
          }),
        },
      });
    } catch (err) {
      console.error(err);
      let message = "";
      if (!_.isEmpty(err.response) && !_.isEmpty(err.response.data)) {
        message = err.response.data.message;
      }
      let errMsgKey = httpErrorStatusToMessageKey(message, false, true);
      // In case where service is new and there's a 409 status code, make sure
      // the errMsgKey is set to duplicate ID as this is the only viable 409
      // error in this case.
      if (isNew && _.get(err, "response.data.status", 200) === 409) {
        errMsgKey = "httpError.duplicateID";
      }
      setApiErrorOnSubmitMessage(errMsgKey);
    }
  };

  // Gets the current state of the service details, formatted slightly
  // differently depending on whether its being used for the ReportCard or to
  // send to the API.
  const getCurrentServiceDetails = (forReportCard) => {
    const newServiceDetails = Object.assign({}, serviceDetails);
    newServiceDetails.key = key;
    newServiceDetails.enabled = isServiceVisible;
    newServiceDetails.formula = _.trim(formula);
    newServiceDetails.informationUrl = infoURL;
    newServiceDetails.applicationUrl = appURL;
    if (newServiceDetails.rank === "" || newServiceDetails.rank === undefined) {
      newServiceDetails.rank = -1;
    }
    if (forReportCard) {
      newServiceDetails.name = name;
      newServiceDetails.category = category;
      newServiceDetails.description = description;
      newServiceDetails.eligibility = eligibility;
      newServiceDetails.instructions = instructions;
      newServiceDetails.preparation = preparation;
    } else {
      if (_.isEmpty(newServiceDetails.resources)) {
        newServiceDetails.resources = {
          en: {},
        };
      }
      // Trim fields again on save, because if there was no validity error,
      // the page will not have re-rendered and the state variables will not
      // be updated with the trimmed version of the text.
      newServiceDetails.resources.en.name = _.trim(name);
      newServiceDetails.resources.en.category = _.trim(category);
      newServiceDetails.resources.en.description = _.trim(description);
      newServiceDetails.resources.en.eligibility = _.trim(eligibility);
      newServiceDetails.resources.en.instructions = _.trim(instructions);
      newServiceDetails.resources.en.preparation = _.trim(preparation);
    }
    return newServiceDetails;
  };

  // Returns true if all required fields are missing.
  const missingAllRequiredFields = () => {
    return (
      name === "" && description === "" && category === "" && infoURL === ""
    );
  };

  return (
    <Fragment>
      {apiErrorOnGetMessage !== "" && (
        <HttpError
          errorMessage={t(apiErrorOnGetMessage, {
            // Some error messages have this parameter.
            service: key,
          })}
        />
      )}
      {((isNew && apiErrorOnGetMessage === "") ||
        (Object.keys(serviceDetails).length > 0 &&
          questionKeys.length > 0)) && (
        <Fragment>
          {renderMessage(
            validationErrorOnSubmit
              ? t("validationError")
              : t(apiErrorOnSubmitMessage),
            updateMessage,
            dismissed,
            () => setDismissed(true)
          )}
          <Segment basic className={styles.segmentSpacing}>
            <Grid verticalAlign="middle">
              <Grid.Column width={13}>
                <Breadcrumb as="strong">
                  <Breadcrumb.Section>
                    <Link to="/app/services">
                      {t("updateService.allServices")}
                    </Link>
                  </Breadcrumb.Section>
                  <Breadcrumb.Divider icon="right chevron" />
                  <Breadcrumb.Section>
                    {isNew ? t("updateService.new") : name}
                  </Breadcrumb.Section>
                </Breadcrumb>
              </Grid.Column>
              <Grid.Column
                width={3}
                textAlign="right"
                className={styles.saveButtonGrid}
              >
                <Button primary onClick={onSave}>
                  {t("updateService.save")}
                </Button>
                {showModal && (
                  <SubmissionModal
                    open={showModal}
                    onClose={() => setShowModal(false)}
                    onConfirm={() => {
                      setShowModal(false);
                      sendUpdates();
                    }}
                  />
                )}
              </Grid.Column>
            </Grid>
          </Segment>
          <Segment basic className={styles.segmentSpacing}>
            <Grid className={styles.paddingtop}>
              <Header as="h1" className={styles.serviceHeader}>
                {isNew ? t("updateService.new") : name}
              </Header>
              {!isServiceVisible && (
                <div className={styles.hiddenTag}>
                  {t("updateService.hidden")}
                </div>
              )}
              <Grid.Row stretched>
                <Grid.Column width={8}>
                  <ServiceForm
                    serviceKey={key}
                    onKeyChange={(evt) => {
                      setKey(_.trim(evt.target.value));
                      if (!serviceKeyRegexp.test(_.trim(evt.target.value))) {
                        setvalidKey(false);
                      } else {
                        setvalidKey(true);
                      }
                    }}
                    name={name}
                    onNameChange={(evt) => {
                      setName(evt.target.value);
                      if (_.isEmpty(evt.target.value)) {
                        setValidName(false);
                      } else {
                        setValidName(true);
                      }
                    }}
                    category={category}
                    onCategoryChange={(evt) => {
                      setCategory(evt.target.value);
                      if (_.isEmpty(evt.target.value)) {
                        setValidCategory(false);
                      } else {
                        setValidCategory(true);
                      }
                    }}
                    description={description}
                    onDescChange={(evt) => {
                      setDescription(evt.target.value);
                      if (_.isEmpty(evt.target.value)) {
                        setValidDesc(false);
                      } else {
                        setValidDesc(true);
                      }
                    }}
                    eligibility={eligibility}
                    onEligibilityChange={(evt) =>
                      setEligibility(evt.target.value)
                    }
                    infoURL={infoURL}
                    onInfoURLChange={(evt) => {
                      setInfoURL(_.trim(evt.target.value));
                      if (!urlRegexp.test(_.trim(evt.target.value))) {
                        setValidInfoURL(false);
                      } else {
                        setValidInfoURL(true);
                      }
                    }}
                    instructions={instructions}
                    onInstructionsChange={(evt) =>
                      setInstructions(evt.target.value)
                    }
                    appURL={appURL}
                    onAppURLChange={(evt) => {
                      setAppURL(_.trim(evt.target.value));
                      if (
                        !_.isEmpty(_.trim(evt.target.value)) &&
                        !urlRegexp.test(_.trim(evt.target.value))
                      ) {
                        setValidAppURL(false);
                      } else {
                        setValidAppURL(true);
                      }
                    }}
                    preparation={preparation}
                    onPrepChange={(evt) => setPreparation(evt.target.value)}
                    isServiceVisible={isServiceVisible}
                    onVisibilityChange={(_, data) =>
                      setIsServiceVisible(data.checked)
                    }
                    markAllUpToDate={markAllUpToDate}
                    onUpToDateChange={() =>
                      setMarkAllUpToDate(!markAllUpToDate)
                    }
                    formula={formula}
                    onFormulaChange={(evt) => {
                      setFormulaError("");
                      setFormulaSuccess("");
                      setFormula(evt.target.value);
                    }}
                    formulaError={formulaError}
                    formulaSuccess={formulaSuccess}
                    questionKeys={questionKeys}
                    onValidateClick={onValidateClick}
                    resourceVersions={
                      serviceDetails.resourceVersions
                        ? serviceDetails.resourceVersions
                        : {}
                    }
                    isNew={isNew}
                    showKeyError={validationErrorOnSubmit && !validKey}
                    showNameError={validationErrorOnSubmit && !validName}
                    showCategoryError={
                      validationErrorOnSubmit && !validCategory
                    }
                    showDescError={validationErrorOnSubmit && !validDesc}
                    showInfoURLError={validationErrorOnSubmit && !validInfoURL}
                    showAppURLError={validationErrorOnSubmit && !validAppURL}
                  />
                </Grid.Column>
                <Grid.Column width={8} className={styles.preview}>
                  <Container className={styles.card}>
                    <Header as="h2" className={styles.previewHeader}>
                      {t("updateService.preview")}
                    </Header>
                    {missingAllRequiredFields() ? (
                      <p>{t("updateService.addDetails")}</p>
                    ) : (
                      <ReportCard
                        service={getCurrentServiceDetails(true)}
                        expanded={true}
                      />
                    )}
                  </Container>
                </Grid.Column>
              </Grid.Row>
            </Grid>
          </Segment>
        </Fragment>
      )}
    </Fragment>
  );
}

UpdateService.propTypes = {
  /**
   * Indicates if the service being updated is brand new (i.e. created), or
   * existing.
   */
  isNew: PropTypes.bool,
};

UpdateService.defaultProps = {
  /** By default, the page will render as if the service is existing. */
  isNew: false,
};

export default UpdateService;
