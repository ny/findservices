import React from "react";
import { Route, Switch, Redirect } from "react-router-dom";
import ManageServices from "features/manageServices/ManageServices";
import UpdateService from "features/updateService/UpdateService";
import UpdateServiceLocale from "features/updateServiceLocale/UpdateServiceLocale";
import HttpError from "components/HttpError";
import oktaConfig from "./auth/oktaConfig";
import CustomLoginCallback from "./auth/CustomLoginCallback";
import { useTranslation } from "react-i18next";
import { Security, SecureRoute } from "@okta/okta-react";
/**
 * @returns {React.ReactElement} Routes the supported paths to components
 */
function Routes() {
  const { t } = useTranslation();

  return (
    <Security {...oktaConfig.oidc}>
      <Switch>
        <SecureRoute exact path="/">
          <Redirect to="/app/services" push={true} />
        </SecureRoute>
        <Route path="/callback" component={CustomLoginCallback} />
        <SecureRoute
          path="/app/services/create"
          render={() => <UpdateService isNew={true} />}
        />
        <SecureRoute
          path="/app/services/update/:id/locale/:lng"
          component={UpdateServiceLocale}
        />
        <SecureRoute
          path="/app/services/update/:id"
          component={UpdateService}
        />
        <SecureRoute path="/app/services" component={ManageServices} />
        <SecureRoute
          path="*"
          render={() => <HttpError errorMessage={t("httpError.generic404")} />}
        />
      </Switch>
    </Security>
  );
}

export default Routes;
