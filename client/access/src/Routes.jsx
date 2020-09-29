import AppLayout from "components/AppLayout";
import Http404 from "components/Http404";
import Checks from "features/checks/components/Checks";
import PrintReport from "features/report/components/PrintReport";
import Report from "features/report/components/Report";
import Review from "features/review/components/Review.jsx";
import { selectResponses } from "features/review/slices/responsesSlice";
import Services from "features/services/components/Services.jsx";
import Survey from "features/survey/components/Survey";
import { selectSurvey } from "features/survey/slices/surveySlice";
import React from "react";
import { useSelector } from "react-redux";
import { Redirect, Route, Switch } from "react-router-dom";
import RouteGuard from "RouteGuard";
import isResponseMissing from "util/isResponseMissing";

/**
 * @returns {React.ReactElement} Routes the supported paths to components
 */
function Routes() {
  const survey = useSelector(selectSurvey);
  const responses = useSelector(selectResponses);

  return (
    <Switch>
      <Route exact path="/">
        <Redirect to="/app/survey" push={true} />
      </Route>
      <Route path="/app/checks">
        <AppLayout>
          <Checks />
        </AppLayout>
      </Route>
      <Route path="/app/survey">
        <AppLayout>
          <Survey />
        </AppLayout>
      </Route>
      <Route path="/app/list/print">
        <AppLayout>
          <PrintReport />
        </AppLayout>
      </Route>
      <RouteGuard
        when={isResponseMissing(survey, responses)}
        redirectPath="/app/survey"
        path="/app/review"
      >
        {/* TODO: Wrapping Review in AppLayout throws off focus in the Services
        page for an unknown reason. When the user navigates from Review to
        Services by clicking the "See Services" button, the focus does not start
        at the top of the page and the skip to main content link is not first in
        the tab order. This needs further investigation. For now, AppLayout is
        rendered within the Review component and that solves the issue. */}
        <Review />
      </RouteGuard>
      <RouteGuard
        when={isResponseMissing(survey, responses)}
        redirectPath="/app/survey"
        path="/app/services"
      >
        <AppLayout>
          <Services />
        </AppLayout>
      </RouteGuard>
      <Route path="/app/list">
        <AppLayout>
          <Report />
        </AppLayout>
      </Route>
      <Route path="*">
        <AppLayout>
          <Http404 />
        </AppLayout>
      </Route>
    </Switch>
  );
}

export default Routes;
