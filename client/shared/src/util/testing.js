import { render } from "@testing-library/react";
import i18next from "i18next";
import PropTypes from "prop-types";
import React from "react";
import { I18nextProvider } from "react-i18next";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import configureStore from "redux-mock-store";
import thunk from "redux-thunk";

// Configure i18next for testing. The "cimode" locale simply tells i18next to
// provide the translation keys as the translation, perfect for tests.
const i18nTestingInstance = i18next.createInstance();

i18nTestingInstance.init({
  lng: "cimode",
  ns: ["translation", "catalog"],
  defaultNS: "translation",
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
  resources: { en: { translations: {} } },
});

// Configure redux with a mock. 'redux-thunk' is middleware that it is included
// by default with redux-toolkit, so I'm including it here to ensure that our
// testing configuration doesn't differ too greatly from our standard.

const mockStore = configureStore([thunk]);

/**
 * Wraps the `render` method from "@testing-library/react" with configurable
 * components that our app uses, such as redux, i18next, and router. Use this as
 * a replacement wherever you would use the base version in our tests. It
 * returns whatever the underlying call to `render` returns.
 *
 * Examples:
 *
 *  render(<App />); // render with default options
 *  --
 *  const options = {
 *    state: { foo: "bar" }
 *  };
 *  render(<App />, options); // render with initial redux state
 *  --
 *  const options = {
 *    routerOptions: {
 *     initialEntries: ["/app/review"],
 *    }
 *  };
 *  render(<App />, options); // render with initial router state
 *
 * The options object accepts the following properties, all optional:
 *
 * const options = {
 *    // initial state passed to redux-mock-store
 *   state: {},
 *
 *   // custom redux store to override default
 *   store: {},
 *
 *   // any options allowed by MemoryRouter
 *   // see https://reactrouter.com/web/api/MemoryRouter
 *   routerOptions: {},
 *
 *   // any options allowed by render
 *   // see https://testing-library.com/docs/react-testing-library/api#render-options
 *   renderOptions: {}
 * };
 */
function renderWith(
  html,
  {
    state = {},
    store = mockStore(state),
    routerOptions = {},
    ...renderOptions
  } = {}
) {
  const wrapper = ({ children }) => (
    <Provider store={store}>
      <I18nextProvider i18n={i18nTestingInstance}>
        <MemoryRouter {...routerOptions}>{children}</MemoryRouter>
      </I18nextProvider>
    </Provider>
  );
  wrapper.propTypes = {
    children: PropTypes.element.isRequired,
  };

  return render(html, { wrapper: wrapper, ...renderOptions });
}

export { renderWith, mockStore, i18nTestingInstance };
