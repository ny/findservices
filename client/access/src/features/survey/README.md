# Survey

This folder implements the survey feature of Project Maslow.

## Overview

The survey feature is the entrypoint into the Project Maslow application. It is
displayed when the resident navigates to `/` or `/app/survey`. It implements a
core concept to the application, that of a _survey_.

### Data

A _survey_ is a set of _questions_, divided into _sections_ (or
_steps_). The survey is dynamically constructed from data fetched from our API
at `/api/explore/v1/catalog`, which roughly looks like this:

```json
survey: [{
  SECTION_YOURSELF: [
    "IS_EMPLOYED"
  ]}, {
  SECTION_HOUSEHOLD: [
    "HOUSEHOLD_SIZE",
    "HOUSEHOLD_INCOME",
  ]},
],
questions: {
  IS_EMPLOYED: {
    type: "BOOLEAN",
  },
  HOUSEHOLD_SIZE: {
    type: "NUMBER",
  },
  HOUSEHOLD_INCOME: {
    type: "CURRENCY",
  },
},
```

Dynamically configuring the survey from data is one of the key features of the
application and extends its useful life. Some things to note about the data
above:

- The `survey` data is an array instead of an object. This is because
  the order of the sections and their questions is important. With an object (or
  map), we're unable to rely on a stable order.
- Each question and section has a key (such as "SECTION_YOURSELF" or
  "IS_EMPLOYED"). These keys are used throughout the application is many ways,
  such as to lookup translations, wire up form validation, and reference
  resident responses in service formulas.
- The question keys under each section key in the `survey` object above match up
  with the question keys under the `questions` object.

### Components

The feature is implemented across several components:

- [**Survey**](#survey) is the top-level component and entrypoint for the feature
- [**SurveyIntro**](#surveyintro) is an informational view that welcomes the
  resident to the application.
- [**SurveySection**](#surveysection) and [**SurveyQuestion**](#surveyquestion)
  construct the survey user experience from the data and store the resident's
  responses in Redux
- [**BooleanQuestion**](#booleanquestion) and
  [**NumberQuestion**](#numberquestion) provide custom form controls

Note that the [**Survey**](#survey) component exists for the lifetime of the
`/app/survey` route. All other components in the feature are conditionally
rendered by [**Survey**](#survey) and its children. If you refresh the browser
on the `/app/survey` route, it will reload the [**Survey**](#survey) component
and conditionally render its children based on whatever Redux data survived the
refresh (which is typically none). This generally means that a refresh on any
step of the survey will take you back to [**SurveyIntro**](#surveyintro) (which
is working as intended).

## Components

### Survey

The principal function of this component is to manage the navigational state of
the survey. There are three main states:

- `isErrorPage` &mdash; _show the error page_. This is only displayed if we cannot
  fetch meaningful survey configuration data from our API. This would be an
  extremely rare error, generally only caused by a misconfiguration of the
  server or the data.
- `isIntroPage` &mdash; _show the landing page_. The landing page welcomes the
  resident to the application and informs them of our privacy policy. We always
  start the resident's experience at the landing page, even when they've
  ventured further into the survey and refreshed their browser.
- `isSurveySection` &mdash; _show the appropriate survey section_. Since the
  survey may be divided into multiple sections (also called _steps_), the Survey
  component also manages the state of which step the resident is on.

The survey conditionally displays navigation depending on the state. There are
four logical actions in the navigation:

1. `init` - displayed as "Get started" in the `isIntroPage` state and navigates
   the resident to the first survey section.
2. `back` - displayed as "Back" in the `isSurveySection` state and navigates the
   the resident to the previous survey section or landing page.
3. `next` - displayed as "Continue" in the `isSurveySection` state whenever
   there is another section in the survey and navigates the resident to the next
   section.
4. `done` - displayed as "Continue" in the `isSurveySection`state on the last
   section of the survey and navigates the resident to the review feature.

Crucially, the survey also triggers form validation whenever the resident tries
to progress to the next section or review page. If there any responses missing,
the resident is not allowed to take the `next` or `done` action until they
provide the missing responses. They can still go `back` though.

### SurveyIntro

A simple component that displays static content to welcome the resident to the
application and link to our privacy policy.

### SurveySection

This component is effectively just a loop over questions in a particular
section, rendering a SurveyQuestion for each question. It also sets the initial
keyboard focus to the first question in the section.

### SurveyQuestion

This component has two main responsibilities:

1. render the correct question component for the question type (that is, a
   BooleanQuestion for questions of type "BOOLEAN" and a NumberQuestion for
   questions of type "CURRENCY" or "NUMBER").
2. read/write the state of the question component to Redux, translating data
   between the format required by the components and the desired by the Redux
   store. For example, we translate "yes" (a string) to/from `true` (a boolean)
   and "123" (a string) to/from `123` (a number).

### Boolean Question

This component renders questions of type "BOOLEAN" as yes/no radio buttons.

### Number Question

This component renders questions of type "CURRENCY" and "NUMBER" as number
inputs. The only difference between "CURRENCY" and "NUMBER" is whether we
render a currency symbol in the input field.
