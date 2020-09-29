import TagManager from "react-gtm-module";
import i18n from "i18n";

/**
 * Sends a custom Google Analytics dataLayer event indicating that the page view
 * has changed. Since Google Analytics does not track route changes unless the
 * browser reloads, this event is required to track when the page view changes
 * in a single page application.
 *
 * @param {string} path a path representing the displayed page. Does not need to
 * be the URL Path, but there should be a 1:1 relationship between a given page
 * view and its chosen mock path.
 * @param {string} title a descriptive title for the displayed page.
 */
function sendPageViewEvent(path, title) {
  TagManager.dataLayer({
    dataLayer: {
      event: "pageviewCustomEvent",
      pagePath: path,
      pageTitle: title,
      // @ts-ignore
      language: i18n.language,
    },
  });
}

/**
 * Sends an event indicating that the user has submitted a section of the survey
 *
 * @param {object} responses the subset of the responses section of the Redux
 * state to be logged by this event.
 */
function sendFormEvent(responses) {
  TagManager.dataLayer({
    dataLayer: {
      event: "formSubmit",
      ...responses,
    },
  });
}

/**
 * Sends an event indicating that the user has taken an action related to one
 * of the social services that they may qualify for.
 *
 * @param {string} eventName name of the event as it will appear in Google
 * Analytics
 * @param {string} serviceName name of the social service attached to this
 * event
 */
function sendServiceEvent(eventName, serviceName) {
  TagManager.dataLayer({
    dataLayer: {
      event: eventName,
      service: serviceName,
    },
  });
}

/**
 * Sends an event indicating that the user has taken the general action.
 *
 * @param {string} eventName name of the event as it will appear in Google
 * Analytics
 */
function sendEvent(eventName) {
  TagManager.dataLayer({
    dataLayer: {
      event: eventName,
    },
  });
}

export { sendPageViewEvent, sendFormEvent, sendServiceEvent, sendEvent };
