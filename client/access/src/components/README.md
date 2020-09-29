# Components

This folder contains components that are shared across multiple features of
Maslow Access.

## Overview

Most of the components we use for Maslow are from [Semantic
UI](https://react.semantic-ui.com/) but we have a few components that we use for
common elements such as the application layout, error pages, and fixed content.
The components are:

- `AppLayout`: Defines the page layout template for all application routes.
- `Catalog`: Loads configuration from the server & manages loading/error states.
- `GenericErrorPage`: Displayed for all unexpected or unrecoverable errors.
- `Http404`: An error page shown if the user navigates to an invalid route.
- `SetTitle`: Modifies the `<title>` tag in the HTML head content.
- `StickToBottom`: Fixes content below the fold to the bottom of the viewport.

## Modules

### AppLayout

A consistent application structure with [landmark accessibility
regions](https://webaim.org/techniques/aria/#landmarks) is required for the app
to be WCAG2.0 compliant. AppLayout defines these landmark regions, and
implements a skip to main content link allowing for simple keyboard navigation
and improved usability for screen readers.

See [the shared components](../../../shared/src/components) for more detail on
the header and footer content.

### Catalog

The catalog component is used to wrap the app and provide automatic
initialization of user and server state. This handles all the Redux logic to set
up the store and provide that access to child components. On initialization, the
component loads any local state from the browser and calls the API to pull
remote service and eligibility data.

The catalog will not render the application while server data is still loading,
and displays the [GenericErrorPage](#GenericErrorPage) to the user if the server
fetch fails.

### GenericErrorPage

A fallback error page used when the application enters an unexpected and/or
unrecoverable state. The page currently just links the user to
https://ny.gov/services.

### Http404

A 404 page, displayed specifically when the user attempts to navigate to a route
that the application does not recognize. Unlike [GenericErrorPage
](#GenericErrorPage), `Http404` will prompt the user to try starting over from
the beginning of the survey.

### SetTitle

A light wrapper around [react-helmet](https://github.com/nfl/react-helmet) that
defines a standard `<title>` template. It is used by several components to
change the page title as the user navigates the application. This is especially
useful for providing context to screen reader users, as the page title is read
aloud each time it changes.

### StickToBottom

There is a fixed button at the bottom of the page when the [`SurveyIntro`
](../features/survey#surveyintro), [`Review`](../features/review), and [`Services`
](../features/services) components load. As the user scrolls down the page, the
button remains fixed to the bottom of the screen until the user scrolls to the
location in the DOM where that element is defined. Upon reaching that location,
the button snaps into its static position in the DOM. It remains there, even if
the user continues to scroll down. If the user scrolls up above the button's
static position, then the button will pop out of its static position and fix
itself to the bottom of the screen again.

StickToBottom contains the logic that implements this behavior, utilitzing
Semantic UI's [`Visibility` component
](https://react.semantic-ui.com/behaviors/visibility/) to determine when its
content should be fixed and when it should follow the document flow.
