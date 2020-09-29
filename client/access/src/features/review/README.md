# Review

This folder implements the review feature of Project Maslow, which is the page
summarizing the resident's answers.

## Overview

The review feature summarizes the resident's answers to the survey section of
the Project Maslow application. It is displayed when the resident completes the
questions in the survey and before the resident is presented with a list of
recommended services. The question, along with the resident's answer, is
displayed in a list. Each section of the displayed questions also has an "Edit"
button to take the resident back to that section to edit their answers.

### Data

Redux is used to store the resident's responses to questions, accessible via the
[responsesSlice](slices/responsesSlice.js).

## Components

The feature is implemented across two components:

- Review
- ReviewSection

### Review

Review is the top-level component which displays a summary of the resident's
responses, separated into sections, and gives the resident an opportunity to
edit their responses for a section before continuing on to view the recommended
services.

### ReviewSection

ReviewSection displays a list of the resident's responses next to the questions
asked. The questions in the ReviewSection all pertain to one section in the
survey, for example the "household" section. All questions with corresponding
answers are displayed.
