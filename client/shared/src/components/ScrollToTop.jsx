import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * A React Hook that scrolls the viewport to the top of page.
 *
 * @param deps a list of values that trigger a scroll to top when changed. Leave
 * empty to only scroll to top on mount.
 */
function useScrollToTop(deps = []) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps
}

/**
 * A React component placed as the first element within a Router to trigger a
 * scroll to top on every Route change.
 *
 * Adapted from https://reactrouter.com/web/guides/scroll-restoration.
 *
 * E.g.
 * ```
 * function App() {
 *  return (
 *    <Router>
 *      <ScrollToTopOnRouteChange />
 *      <RestOfApp />
 *    </Router>
 *  );
 * }
 * ```
 */
function ScrollToTopOnRouteChange() {
  const { pathname } = useLocation();
  useScrollToTop([pathname]);
  return null;
}

export { ScrollToTopOnRouteChange, useScrollToTop };
