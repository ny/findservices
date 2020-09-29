import App from "App";
import React, { Suspense } from "react";
import axe from "react-axe";
import ReactDOM from "react-dom";
import { BrowserRouter as Router } from "react-router-dom";
import i18n from "i18n";
import { I18nextProvider } from "react-i18next";
import * as serviceWorker from "serviceWorker";
import "maslow-shared/src/theme/semantic.maslow.css";

const Empty = () => <div></div>;

ReactDOM.render(
  <React.StrictMode>
    <I18nextProvider i18n={i18n}>
      <Router>
        <Suspense fallback={<Empty />}>
          <App />
        </Suspense>
      </Router>
    </I18nextProvider>
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
