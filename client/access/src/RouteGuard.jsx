import PropTypes from "prop-types";
import React from "react";
import { Route, Redirect } from "react-router-dom";

/**
 * @param {object} props
 *   - children: children components
 *   - when: boolean indicating redirect; redirect when true and render children
 *     when false
 * @returns {React.ReactElement} A higher-order component that conditionally
 * redirects or renders the children components.
 */
function RouteGuard({ children, when, redirectPath, ...routeOptions }) {
  return (
    <Route {...routeOptions}>
      {when ? <Redirect to={redirectPath} /> : children}
    </Route>
  );
}

RouteGuard.propTypes = {
  children: PropTypes.node.isRequired,
  when: PropTypes.bool.isRequired,
  redirectPath: PropTypes.string.isRequired,
  path: PropTypes.string,
};

export default RouteGuard;
