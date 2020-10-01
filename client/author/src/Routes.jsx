import React from "react";
import { Route, Switch, Redirect } from "react-router-dom";
import ManageServices from "features/manageServices/ManageServices";
import UpdateService from "features/updateService/UpdateService";
import UpdateServiceLocale from "features/updateServiceLocale/UpdateServiceLocale";
import HttpError from "components/HttpError";
import { useTranslation } from "react-i18next";

/**
 * @returns {React.ReactElement} Routes the supported paths to components
 */
function Routes() {
  const { t } = useTranslation();

  return (
    <Switch>
      <Route exact path="/">
        <Redirect to="/app/services" push={true} />
      </Route>
      <Route
        path="/app/services/create"
        render={() => <UpdateService isNew={true} />}
      />
      <Route
        path="/app/services/update/:id/locale/:lng"
        component={UpdateServiceLocale}
      />
      <Route path="/app/services/update/:id" component={UpdateService} />
      <Route path="/app/services" component={ManageServices} />
      <Route
        path="*"
        render={() => <HttpError errorMessage={t("httpError.generic404")} />}
      ></Route>
    </Switch>
  );
}

export default Routes;
