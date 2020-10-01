import React, { Fragment, useCallback, useEffect, useState } from "react";
import { useTranslation, Trans } from "react-i18next";
import {
  Form,
  Header,
  Container,
  Grid,
  Button,
  Breadcrumb,
  Segment,
  Label,
  Menu,
} from "semantic-ui-react";
import axios from "axios";
import { useHistory, useParams, Link } from "react-router-dom";
import _ from "lodash";
import styles from "features/updateService/UpdateService.module.css";
import markdown from "maslow-shared/src/components/Markdown.module.css";
import {
  getLanguageForLocale,
  renderTextarea,
  renderTextbox,
  renderMessage,
  httpErrorStatusToMessageKey,
} from "utils/inputUtils";
import HttpError from "components/HttpError";
import { ReportCard } from "maslow-shared";

/**
 * UpdateServiceLocale is a component for providing or updating translations
 * for a given language. Content managers can view the English content and
 * provide the appropriate translations.
 */
function UpdateServiceLocale() {
  const { t } = useTranslation();
  const history = useHistory();
  const params = useParams();
  const serviceKey = params.id;
  const locale = params.lng;
  // Gets the full language name, such as "Spanish" for "es".
  const languageName = getLanguageForLocale(locale);

  const [localeETag, setLocaleETag] = useState();
  const [localeData, setLocaleData] = useState({});
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [eligibility, setEligibility] = useState("");
  const [instructions, setInstructions] = useState("");
  const [preparation, setPreparation] = useState("");

  const [englishName, setEnglishName] = useState("");
  const [englishCategory, setEnglishCategory] = useState("");
  const [englishDescription, setEnglishDescription] = useState("");
  const [englishEligibility, setEnglishEligibility] = useState("");
  const [englishInstructions, setEnglishInstructions] = useState("");
  const [englishPreparation, setEnglishPreparation] = useState("");
  const [infoURL, setInfoURL] = useState("");
  const [appURL, setAppURL] = useState("");

  const [resourceVersions, setResourceVersions] = useState({});

  const [showNameError, setNameError] = useState(false);
  const [showCategoryError, setCategoryError] = useState(false);
  const [showDescError, setDescError] = useState(false);
  const [showEligibilityError, setEligibilityError] = useState(false);
  const [showInstructionsError, setInstructionsError] = useState(false);
  const [showPreparationError, setPreparationError] = useState(false);

  const [dismissed, setDismissed] = useState(false);
  const [apiErrorOnSubmitMessage, setApiErrorOnSubmitMessage] = useState("");
  const [apiErrorOnGetMessage, setApiErrorOnGetMessage] = useState("");
  const [validationErrorOnSubmit, setValidationErrorOnSubmit] = useState(false);

  const [activeView, setActiveView] = useState("text");

  // Retrieves catalog data from API.
  const fetchData = useCallback(async () => {
    if (_.isEmpty(languageName)) {
      // If the languageName does not exist in the languageToLocale map, throw
      // a 404.
      setApiErrorOnGetMessage("httpError.missingLocale");
      return;
    }

    let englishData = {};

    try {
      // Get information about the service.
      const serviceResponse = await axios.get(
        `/api/author/v1/services/${serviceKey}`
      );

      // Set the resource versions to later check if translations are updated.
      setResourceVersions(serviceResponse.data.resourceVersions);

      setInfoURL(serviceResponse.data.informationUrl);
      setAppURL(serviceResponse.data.applicationUrl);

      englishData = serviceResponse.data.resources.en;
      setEnglishCategory(englishData.category);
      setEnglishDescription(englishData.description);
      setEnglishEligibility(englishData.eligibility);
      setEnglishInstructions(englishData.instructions);
      setEnglishPreparation(englishData.preparation);
      // Set this last since it is used to check for readiness to render the
      // page
      setEnglishName(englishData.name);

      // Get and set locale fields.
      const localeResponseData = serviceResponse.data.resources[locale] || {};
      if (!_.isEmpty(localeResponseData)) {
        setName(localeResponseData.name);
        setCategory(localeResponseData.category);
        setDescription(localeResponseData.description);
        setEligibility(localeResponseData.eligibility);
        setInstructions(localeResponseData.instructions);
        setPreparation(localeResponseData.preparation);
        setLocaleData(localeResponseData);

        // Even though the data we need for this page can be conveniently found
        // in serviceResponse, we unfortunately need to get the eTag from a
        // different API call in order to implement checking for concurrent
        // edits. This is only relevant if the locale exists.
        const serviceResourceResponse = await axios.get(
          `/api/author/v1/services/${serviceKey}/locales/${locale}`
        );
        setLocaleETag(_.get(serviceResourceResponse, "headers.etag", ""));
      }

      setNameError(
        !_.isEmpty(englishData.name) && _.isEmpty(localeResponseData.name)
      );
      setCategoryError(
        !_.isEmpty(englishData.category) &&
          _.isEmpty(localeResponseData.category)
      );
      setDescError(
        !_.isEmpty(englishData.description) &&
          _.isEmpty(localeResponseData.description)
      );
      setEligibilityError(
        !_.isEmpty(englishData.eligibility) &&
          _.isEmpty(localeResponseData.eligibility)
      );
      setInstructionsError(
        !_.isEmpty(englishData.instructions) &&
          _.isEmpty(localeResponseData.instructions)
      );
      setPreparationError(
        !_.isEmpty(englishData.preparation) &&
          _.isEmpty(localeResponseData.preparation)
      );
    } catch (err) {
      let message = "";
      if (!_.isEmpty(err.response) && !_.isEmpty(err.response.data)) {
        message = err.response.data.message;
      }
      const errMsgKey = httpErrorStatusToMessageKey(message, true, false);
      if (errMsgKey === "") {
        // If there is no error message, this indicates the error was due to
        // no locale data for this language (which is expected for languages
        // for which translations have not yet been added). Set the response
        // to an empty object.
        setLocaleData({});
      } else {
        setApiErrorOnGetMessage(errMsgKey);
      }
    }
  }, [
    serviceKey,
    locale,
    setLocaleData,
    languageName,
    setName,
    setCategory,
    setDescription,
    setEligibility,
    setInstructions,
    setPreparation,
    setEnglishName,
    setEnglishCategory,
    setEnglishDescription,
    setEnglishEligibility,
    setEnglishInstructions,
    setEnglishPreparation,
    setApiErrorOnGetMessage,
    setResourceVersions,
    setInfoURL,
    setAppURL,
    setNameError,
    setCategoryError,
    setDescError,
    setEligibilityError,
    setInstructionsError,
    setPreparationError,
  ]);

  // Determines the status (up to date, outdated, missing translations) of the
  // locale's translation and returns a label to render accordingly.
  function translationStatus() {
    if (!(locale in resourceVersions)) {
      // "Not translated" translation label.
      return (
        <Label
          className={`${styles.translationStatusMessage} ${styles.translationStatusNotTranslated}`}
        >
          {t("manageServices.notTranslated")}
        </Label>
      );
    }
    // Check whether the hash for the language is the same as that for
    // English. If not, the translation is outdated.
    if (resourceVersions[locale] === resourceVersions["en"]) {
      // "Up to date" translation label.
      return (
        <Label
          className={`${styles.translationStatusMessage} ${styles.translationStatusUpToDate}`}
        >
          {t("manageServices.translated")}
        </Label>
      );
    } else {
      // "Outdated" translation label.
      return (
        <Label
          className={`${styles.translationStatusMessage} ${styles.translationStatusOutdated}`}
        >
          {t("manageServices.outdated")}
        </Label>
      );
    }
  }

  // Retrieves data for the given service from the API and sets state.
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle content manager saving changes to a service.
  const handleSave = async () => {
    if (
      showNameError ||
      showCategoryError ||
      showDescError ||
      showEligibilityError ||
      showInstructionsError ||
      showPreparationError
    ) {
      setValidationErrorOnSubmit(true);
      return;
    }

    // Send updates to API with localized data.
    let newLocaleDetails = Object.assign({}, localeData);
    if (_.isEmpty(newLocaleDetails)) {
      newLocaleDetails = {};
    }
    newLocaleDetails.name = name.trim();
    newLocaleDetails.category = category.trim();
    newLocaleDetails.description = description.trim();
    newLocaleDetails.eligibility = eligibility && eligibility.trim();
    newLocaleDetails.instructions = instructions && instructions.trim();
    newLocaleDetails.preparation = preparation && preparation.trim();

    let options = {};
    if (localeETag) {
      options = { headers: { "If-Match": localeETag } };
    }

    try {
      await axios.put(
        `/api/author/v1/services/${serviceKey}/locales/${locale}`,
        newLocaleDetails,
        options
      );
      history.push({
        pathname: `/app/services/update/${serviceKey}`,
        state: {
          updateMessage: t("updateService.saveMessage", {
            language: languageName,
          }),
        },
      });
    } catch (err) {
      console.error(err);
      let message = "";
      if (!_.isEmpty(err.response) && !_.isEmpty(err.response.data)) {
        message = err.response.data.message;
      }
      const errMsgKey = httpErrorStatusToMessageKey(message, true, true);
      setApiErrorOnSubmitMessage(errMsgKey);
    }
  };

  const getTranslatedServiceDetails = () => {
    return {
      name: name,
      category: category,
      description: description,
      informationUrl: infoURL,
      applicationUrl: appURL,
      instructions: instructions,
      preparation: preparation,
      eligibility: eligibility,
    };
  };

  return (
    <Fragment>
      {apiErrorOnGetMessage !== "" && (
        <HttpError
          errorMessage={t(apiErrorOnGetMessage, {
            // Some error messages have these parameters.
            service: serviceKey,
            locale: locale,
          })}
        />
      )}
      {!!localeData && englishName !== "" && _.isEmpty(apiErrorOnGetMessage) && (
        <Fragment>
          {renderMessage(
            validationErrorOnSubmit
              ? t("validationError")
              : t(apiErrorOnSubmitMessage),
            "" /* No update message */,
            dismissed,
            () => setDismissed(true)
          )}
          <Segment basic className={styles.segmentSpacing}>
            <Grid verticalAlign="middle">
              <Grid.Column width={10}>
                <Breadcrumb as="strong">
                  <Breadcrumb.Section>
                    <Link to="/app/services">
                      {t("updateService.allServices")}
                    </Link>
                  </Breadcrumb.Section>
                  <Breadcrumb.Divider icon="right chevron" />
                  <Breadcrumb.Section>
                    <Link to={`/app/services/update/${serviceKey}`}>
                      {englishName}
                    </Link>
                  </Breadcrumb.Section>
                  <Breadcrumb.Divider icon="right chevron" />
                  <Breadcrumb.Section>{languageName}</Breadcrumb.Section>
                </Breadcrumb>
              </Grid.Column>
              <Grid.Column
                width={6}
                textAlign="right"
                className={styles.saveButtonGrid}
              >
                <Button primary onClick={handleSave}>
                  {t("updateLocale.save")}
                </Button>
              </Grid.Column>
            </Grid>
          </Segment>
          <Segment basic className={styles.segmentSpacing}>
            <Grid>
              <Grid.Row columns={1} className={styles.translationPageTitle}>
                <Header as="h1" className={styles.translationPageHeader}>
                  {t("updateLocale.title", { language: languageName })}
                </Header>
                {resourceVersions && translationStatus()}
              </Grid.Row>
              <Grid.Row stretched columns={2}>
                <Grid.Column className={styles.translationColumn}>
                  <Header as="h2" className={styles.headerPadding}>
                    {t("updateLocale.viewLanguage", { language: languageName })}
                  </Header>
                  <Form>
                    {renderTextbox(
                      t("updateService.name.title"),
                      name,
                      (evt) => {
                        setName(evt.target.value);
                        setNameError(
                          !_.isEmpty(englishName) && _.isEmpty(evt.target.value)
                        );
                      },
                      null,
                      true,
                      false,
                      validationErrorOnSubmit && showNameError,
                      showNameError ? t("missingFieldError") : ""
                    )}
                    {renderTextbox(
                      t("updateService.category.title"),
                      category,
                      (evt) => {
                        setCategory(evt.target.value);
                        setCategoryError(
                          !_.isEmpty(englishCategory) &&
                            _.isEmpty(evt.target.value)
                        );
                      },
                      null,
                      true,
                      false,
                      validationErrorOnSubmit && showCategoryError,
                      showCategoryError ? t("missingFieldError") : ""
                    )}
                    {renderTextarea(
                      t("updateService.description.title"),
                      description,
                      (evt) => {
                        setDescription(evt.target.value);
                        setDescError(
                          !_.isEmpty(englishDescription) &&
                            _.isEmpty(evt.target.value)
                        );
                      },
                      <Trans i18nKey="updateService.description.description">
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
                      true,
                      false,
                      validationErrorOnSubmit && showDescError,
                      showDescError ? t("missingFieldError") : ""
                    )}
                    {renderTextarea(
                      t("updateService.eligibility.title"),
                      eligibility,
                      (evt) => {
                        setEligibility(evt.target.value);
                        setEligibilityError(
                          !_.isEmpty(englishEligibility) &&
                            _.isEmpty(evt.target.value)
                        );
                      },
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
                      false,
                      false,
                      validationErrorOnSubmit && showEligibilityError,
                      showEligibilityError ? t("missingFieldError") : ""
                    )}
                    {renderTextarea(
                      t("updateService.instructions.title"),
                      instructions,
                      (evt) => {
                        setInstructions(evt.target.value);
                        setInstructionsError(
                          !_.isEmpty(englishInstructions) &&
                            _.isEmpty(evt.target.value)
                        );
                      },
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
                      false,
                      false,
                      validationErrorOnSubmit && showInstructionsError,
                      showInstructionsError ? t("missingFieldError") : ""
                    )}
                    {renderTextarea(
                      t("updateService.preparation.title"),
                      preparation,
                      (evt) => {
                        setPreparation(evt.target.value);
                        setPreparationError(
                          !_.isEmpty(englishPreparation) &&
                            _.isEmpty(evt.target.value)
                        );
                      },
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
                      false,
                      false,
                      validationErrorOnSubmit && showPreparationError,
                      showPreparationError ? t("missingFieldError") : ""
                    )}
                  </Form>
                </Grid.Column>
                <Grid.Column
                  className={`${styles.preview} ${styles.translationColumn}`}
                >
                  <Container className={styles.card}>
                    <Menu as="nav" className="nys-blue" pointing secondary>
                      <Menu.Item
                        as="button"
                        className={styles.translationColumnButton}
                        name={t("updateLocale.viewEnglish", {
                          language: languageName,
                        })}
                        active={activeView === "text"}
                        onClick={() => setActiveView("text")}
                      />
                      <Menu.Item
                        as="button"
                        className={styles.translationColumnButton}
                        name={t("updateLocale.previewLanguage", {
                          language: languageName,
                        })}
                        active={activeView === "preview"}
                        onClick={() => setActiveView("preview")}
                      />
                    </Menu>
                    {activeView === "text" && (
                      <Form>
                        {renderTextbox(
                          t("updateService.name.title"),
                          englishName,
                          null,
                          null,
                          true,
                          true // Read only
                        )}
                        {renderTextbox(
                          t("updateService.category.title"),
                          englishCategory,
                          null,
                          null,
                          true,
                          true // Read only
                        )}
                        {renderTextarea(
                          t("updateService.description.title"),
                          englishDescription,
                          null,
                          <Trans i18nKey="updateService.description.description">
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
                          true,
                          true // Read only
                        )}
                        {renderTextarea(
                          t("updateService.eligibility.title"),
                          englishEligibility,
                          null,
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
                          false,
                          true // Read only
                        )}
                        {renderTextarea(
                          t("updateService.instructions.title"),
                          englishInstructions,
                          null,
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
                          false,
                          true // Read only
                        )}
                        {renderTextarea(
                          t("updateService.preparation.title"),
                          englishPreparation,
                          null,
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
                          false,
                          true // Read only
                        )}
                      </Form>
                    )}
                    {activeView === "preview" && (
                      <ReportCard
                        service={getTranslatedServiceDetails()}
                        lng={locale}
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

export default UpdateServiceLocale;
