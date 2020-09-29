import PropTypes from "prop-types";
import React, { useState } from "react";
import { Accordion, Icon } from "semantic-ui-react";

/**
 * A Semantic UI Accordion with only one item. Made as a separate component so
 * that state management is not intertwined with the parent. Also adds
 * accessibility attributes, which the "shorthand" properties passed into the
 * `panels` prop of `Accordion` do not support. See
 * https://react.semantic-ui.com/modules/accordion/#types-standard-shorthand
 * for additional context.
 */
export default function SingletonAccordion({ id, title, children }) {
  const [isOpen, setOpen] = useState(false);
  const toggleOpen = () => setOpen(!isOpen);

  return (
    <Accordion>
      <Accordion.Title
        id={id}
        active={isOpen}
        onClick={toggleOpen}
        aria-expanded={isOpen}
        data-testid="accordion-title"
      >
        <Icon name="dropdown" />
        {title}
      </Accordion.Title>
      <Accordion.Content
        active={isOpen}
        as="section"
        role="region"
        aria-labelledby={id}
      >
        {children}
      </Accordion.Content>
    </Accordion>
  );
}

SingletonAccordion.propTypes = {
  /* An `id` attribute for the accordion title. */
  id: PropTypes.string.isRequired,
  /* The title content for the accordion (displayed both when open & closed). */
  title: PropTypes.node.isRequired,
  /* The content rendered inside of the accordion (displayed only when open). */
  children: PropTypes.node,
};
