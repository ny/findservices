import { i18nStates, selectGlobalFlags } from "app/globalFlagsSlice";
import axios from "axios";
import GenericErrorPage from "components/GenericErrorPage";
import { updateServices } from "features/services/slices/servicesSlice";
import { updateQuestions } from "features/survey/slices/questionsSlice";
import { selectSurvey, updateSurvey } from "features/survey/slices/surveySlice";
import _ from "lodash";
import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import "core-js/es/number";

/**
 * A React higher-order component that initializes the redux store with the
 * catalog data returned from our API before rendering its children. Though it
 * does not load translations itself (see src/i18n.js), it contains the logic
 * which shows an error page if the i18next library fails to load translations.
 */
function Catalog({ children }) {
  const dispatch = useDispatch();
  const survey = useSelector(selectSurvey);
  const { i18nState } = useSelector(selectGlobalFlags);
  const [isError, setIsError] = useState(i18nState === i18nStates.FAILED);
  const isLoading = !isError && (_.isNil(survey) || survey.length === 0);

  useEffect(() => {
    /**
     * Retrieves catalog data from API and stores in Redux
     */
    async function fetchData() {
      try {
        const response = await axios.get("/api/explore/v1/catalog");
        const data = response.data;
        // Store API data in Redux, separated by category.
        dispatch(updateServices(data));
        dispatch(updateQuestions(data));
        // Since we use the survey data as a loading indicator, dispatch it
        // last. This ensures that all other data is saved to Redux by the time
        // we update the isLoading state.
        dispatch(updateSurvey(data));
      } catch (error) {
        console.error("Failed to load the catalog: ", error);
        setIsError(true);
      }
    }

    fetchData();
  }, [dispatch]);

  const Empty = () => <div data-testid="empty"></div>;

  if (isError) {
    return <GenericErrorPage />;
  } else if (isLoading) {
    return <Empty />;
  } else {
    return children;
  }
}

Catalog.propTypes = {
  children: PropTypes.node,
};

export default Catalog;
