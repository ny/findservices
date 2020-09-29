import { useDebouncedFn, useGlobalEvent } from "beautiful-react-hooks";
import PropTypes from "prop-types";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Icon } from "semantic-ui-react";
import styles from "./Expando.module.css";
import i18next from "i18next";

/**
 * A collapsible control that renders child nodes with an accordion
 * expand/collapse button.
 */
export function Expando({ maxHeight, defaultExpanded, lng, children }) {
  const { i18n } = useTranslation();
  const t = i18n.getFixedT(lng);
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [hasOverflow, setHasOverflow] = useState(false);
  const expandoElement = useRef(null);

  const calculateOverflow = () => {
    /**
     * Content overflows if its total height (specified as the DOM node's
     * offsetHeight) exceeds the desired visible height (the max-height CSS
     * property on the `expandoHidden` class).
     */
    if (expandoElement.current) {
      setHasOverflow(expandoElement.current.offsetHeight >= maxHeight);
    }
  };

  useEffect(() => calculateOverflow());

  const toggleExpanded = () => setExpanded(!expanded);

  /**
   * The following window resize functions are used to ensure that the component
   * rerenders when the viewport size changes. Since expandoElement's
   * offsetHeight can become greater than or less than maxHeight as the viewport
   * is resized, it's critical to rerender so that the conditionally rendered
   * gradient & the 'seeMore'/'seeLess' button are displayed only as needed.
   */
  const onWindowResize = useGlobalEvent("resize");
  const WINDOW_RESIZE_DEBOUNCE_MS = 250;
  const onWindowResizeHandler = useDebouncedFn(
    calculateOverflow,
    WINDOW_RESIZE_DEBOUNCE_MS
  );
  onWindowResize(onWindowResizeHandler);

  return (
    <>
      <div
        /**
         * Inline style required so that the CSS max-height property is
         * dynamically updated based on the maxHeight prop passed to this
         * component.
         */
        ref={expandoElement}
        className={expanded ? "" : styles.expandoHidden}
        style={expanded ? {} : { maxHeight: maxHeight }}
      >
        {children}
        {hasOverflow && !expanded && (
          <div className={styles.expandoGradient} data-testid="gradient" />
        )}
      </div>

      {hasOverflow && (
        <Button className={styles.expandoButton} onClick={toggleExpanded}>
          <Icon name={expanded ? "angle up" : "angle down"} />
          {expanded
            ? t("services.actions.seeLess")
            : t("services.actions.seeMore")}
        </Button>
      )}
    </>
  );
}

Expando.propTypes = {
  /* Max height of the container in pixels before overflow content is hidden. */
  maxHeight: PropTypes.number.isRequired,
  /* Show the content as expanded by default (usually collapsed by default). */
  defaultExpanded: PropTypes.bool,
  /* The language that should be used for translated text. */
  lng: PropTypes.string,
  /* The content to render in the expandable container. */
  children: PropTypes.node,
};

Expando.defaultProps = {
  defaultExpanded: false,
  lng: i18next.language,
};
