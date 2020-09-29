import PropTypes from "prop-types";
import React, { Fragment, useState } from "react";
import { Container, Visibility } from "semantic-ui-react";
import styles from "./StickToBottom.module.css";

/**
 *  A React component that renders any passed in React elements in a container
 *  that fixes to the bottom of the viewport until the content is scrolled into
 *  view. Once the content appears in the viewport, it falls into its static
 *  position in the DOM. The content remains in its static position until it
 *  is scrolled _below_ the viewport.
 */
export function StickToBottom({ alwaysFixed, children }) {
  const [isFixed, setIsFixed] = useState(alwaysFixed);

  const handleUpdate = (e, { calculations }) => {
    // Content is fixed when (1) the user's scroll location is above the 
    // invisible div (the top of the div is not in the viewport), and (2) when 
    // the user's scroll location is below the invisible div, even when the 
    // div is no longer in the viewport.
    setIsFixed(!calculations.topVisible && !calculations.bottomPassed);
  };

  return (
    // `Visibility` creates a zero height div that is placed in-line with the
    // parent component's DOM. The `onUpdate` callback fires as the user scrolls
    // the page.
    <Fragment>
      {!alwaysFixed && (
        <Visibility
          data-testid="visibility-tracker"
          fireOnMount={true}
          onUpdate={handleUpdate}
          once={false}
        />
      )}
      <div
        className={isFixed ? styles.fixed : undefined}
        role={isFixed ? "status" : undefined}
        data-testid="sticky-container"
      >
        <Container text>{children}</Container>
      </div>
    </Fragment>
  );
}

StickToBottom.propTypes = {
  /** Force the content to always be fixed to the bottom. */
  alwaysFixed: PropTypes.bool,
  /** React components to render within the sticky container */
  children: PropTypes.node,
};

StickToBottom.defaultProps = {
  alwaysFixed: false,
};
