# Components

This folder contains components that are shared across both the Maslow Access
and Maslow Author frontends.

## Overview

Most of the components we use for Maslow are from [Semantic
UI](https://react.semantic-ui.com/) but we have a few components that we use for
common elements such as the app header, language switcher, or markdown
rendering. The components are:

- `AppHeader`: Renders the global top navbar.
- `AppFooter`: Renders the global footer content.
- `Expando`: A component that collapses content above a certain height.
- `LanguageSwitcher`: A top navbar control for switching languages.
- `Markdown`: Renders Markdown content as React elements.
- `ReportCard`: Displays all data for a service, shared by Access and Author.
- `ScrollToTop`: Utility module to automate scrolling to the top of a page.

## Modules

### AppHeader

The app header contains the organization logo with a link to the root path and a
[language switcher](#LanguageSwitcher).

### AppFooter

The footer implements New York State's standard footer design for single page
applications. It contains links to the government's digital policies and social
media accounts.

### Expando

Lots of content might be rendered when we show information about services, so we
have a control that allows us to render the service information in a collapsed
accordion that the user can choose to expand.

### LanguageSwitcher

Allows the user to switch the language. The languages available are English,
Spanish, Hatian, Russian, Bengali, Korean, and Chinese (as defined by [New
York State policy](https://www.ny.gov/language-access-policy)). Switching these
languages changes the language configured through [i18next
](https://www.i18next.com/). This triggers an event that re-renders all the
content that uses the `t` functions.

### Markdown

This wraps the [react-markdown](https://rexxars.github.io/react-markdown/)
library only allowing a basic subset of Markdown functionality. Any properties
passed to this module is sent through to the `ReactMarkdown` component.

### ReportCard

ReportCard displays information for a given service selected by the resident. It
includes basic information about the service with a link to the service's
website, as well as information and relevant links about how to apply and how to
prepare for the application, if available. If there is an abundance of
information, some is hidden with the option to show more for easier viewing
(see [Expando](#Expando)).

Maslow Access uses this component to show residents information about a service
that they have selected to learn more about (see [the Report feature README
](../../../access/src/features/report)). Maslow Author uses this component
to show administrators a live preview of the service as they make changes to the
service's content.

### ScrollToTop

Defines a component that, when added to a React Router instance, automatically
scrolls to the top of the page each time the application URL route changes. This
behavior is designed to mimic the behavior of more traditional static websites.

The component is implemented with a React Hook, which may also be used to force
specific components to scroll to top (if global scroll to top behavior is not
desirable, or if the browser should be scrolled to top without a route change).
