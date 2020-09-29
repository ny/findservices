import React, { useEffect } from "react";
import { useOktaAuth } from "@okta/okta-react";
import { useTranslation } from "react-i18next";

/**
 * Displays an error when authentication fails and redirects back to application root after 10 seconds
 */
const CustomLoginCallback = () => {
  const { t } = useTranslation();
  const { authService, authState } = useOktaAuth();

  useEffect(() => {
    authService.handleAuthentication();

    if (!authState.isAuthenticated) {
      setTimeout(() => {
        authService.logout();
      }, 10000);
    }
    // eslint-disable-next-line
  }, []);

  if (authState.isPending) {
    return <div>{t("authentication.loading")}</div>;
  }
  if (authState.error) {
    return (
      <div>
        <h1>{t("httpError.title")}</h1>
        <p style={{ color: "red" }}>{authState.error.toString()}</p>
        <p>{t("authentication.authFailedRedirect")}</p>
      </div>
    );
  }
  if (!authState.isAuthenticated) {
    return (
      <div>
        <h1>{t("httpError.title")}</h1>
        <p>{t("authentication.notLoggedIn")}</p>
      </div>
    );
  }
  return null;
};

export default CustomLoginCallback;
