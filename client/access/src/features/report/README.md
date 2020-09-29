# Report

This folder implements the Report feature of Project Maslow, which lets
residents save, print, and share a list of social services that they are
interested in.

## Overview

The Report feature implements a focused list of social services that the
resident is interested in. The list includes information and application details
for services that residents have flagged as being potentially useful for them,
enabling them to plan which services they will apply to receive. Residents can
email, print, or otherwise share their list.

### Data

Information about the services that have been added to the Report is stored in
Redux, accessible via the [reportSlice](slices/reportSlice.js). The selected
services are also passed to the Report as a comma separated `services`
parameter, e.g. `findservices.ny.gov/app/list?services=SNAP,DOL_UA`. The service
keys are extracted and used to pull up information about those services from the
[servicesSlice](../services/slices/servicesSlice.js).

## Components

The feature is implemented across three components:

- Report
- ReportCard
- PrintReport

### Report

Report is the top-level component which displays information about the services
selected by the resident, and buttons for emailing, printing, or otherwise
sharing the list. Each service selected by the resident is rendered in a
separate [ReportCard](../../../../shared/src/components#ReportCard).

### PrintReport

PrintReport displays all of the same information as Report but formatted in a
printer-friendly way.
