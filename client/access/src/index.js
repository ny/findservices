import store from "app/store";
import SetTitle from "components/SetTitle";
import { ScrollToTopOnRouteChange } from "maslow-shared";
import "maslow-shared/src/theme/semantic.maslow.css";
import React, { Suspense } from "react";
import axe from "react-axe";
import ReactDOM from "react-dom";
import TagManager from "react-gtm-module";
import { I18nextProvider } from "react-i18next";
import { Provider } from "react-redux";
import { BrowserRouter as Router } from "react-router-dom";
import Routes from "Routes";
import * as serviceWorker from "serviceWorker";
import i18n from "./i18n";

const tagManagerArgs = {
  gtmId: process.env.REACT_APP_TAG_MANAGER_ID,
};
TagManager.initialize(tagManagerArgs);

const Empty = () => <div></div>;

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <I18nextProvider i18n={i18n}>
        <Router>
          <ScrollToTopOnRouteChange />
          {/* NOTE: Suspense only supports i18next. All other code is 
          responsible for rendering its own loading states. */}
          <Suspense fallback={<Empty />}>
            <SetTitle />
            <Routes />
          </Suspense>
        </Router>
      </I18nextProvider>
    </Provider>
  </React.StrictMode>,
  document.getElementById("root")
);

if (process.env.NODE_ENV !== "production") {
  const axeDebounceTimeoutMillis = 1000;

  // Check for a11y violations and output to console, during development
  axe(React, ReactDOM, axeDebounceTimeoutMillis);
}

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
