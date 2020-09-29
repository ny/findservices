// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom/extend-expect";

// Replace the production i18next instance with a test instance. Required to
// avoid network requests to retrieve translations when running tests.
jest.mock("i18n", () => {
  // Must be required here or jest.mock() throws an out-of-scope error.
  const { i18nTestingInstance } = require("maslow-shared/src/util/testing");
  return {
    i18nAccessInstance: i18nTestingInstance,
  };
});

// Globally mock out the scrollIntoView function, which is used by the AppLayout
// and therefore affects all parent components that render AppLayout.
global.HTMLElement.prototype.scrollIntoView = jest.fn();
