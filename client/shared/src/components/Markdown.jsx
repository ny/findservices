/* eslint-disable react/prop-types */
import isExternalUrl from "is-url-external";
import React from "react";
import ReactMarkdown from "react-markdown";
import styles from "./Markdown.module.css";

const allowedMarkdownNodes = [
  "root",
  "text",
  "break",
  "paragraph",
  "emphasis",
  "strong",
  "link",
  "list",
  "listItem",
];

/**
 * An override to the normal link provided by ReactMarkdown. This component
 * provides custom styling and opens in a new window. Any properties are passed
 * to the underlying <a> tag.
 */
function CustomLink(props) {
  const { href } = props;
  const classes = isExternalUrl(href) ? styles.external : "";
  // Link content is passed from the parent component. The target and rel
  // are set to open links in new tabs, with no reference data passed.
  /* eslint-disable jsx-a11y/anchor-has-content */
  return (
    <a
      {...props}
      className={classes}
      target="_blank"
      rel="noopener noreferrer"
    />
  );
  /* eslint-enable */
}

/**
 * Renders a subset of Markdown content with relevant custom styling. We only
 * allow nodes that we expect to use to prevent arbitrary HTML or unexpected
 * behavior. Any Markdown not explicitly allowed is silently elided.
 */
export function Markdown(props) {
  return (
    <ReactMarkdown
      {...props}
      allowedTypes={allowedMarkdownNodes}
      renderers={{ link: CustomLink }}
    />
  );
}
