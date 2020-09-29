# Services

This folder implements the Services feature of Project Maslow, which lets
residents view information on a list of social services, and select services to
be used in the Report feature.

## Overview

The Services feature displays two groups of social services, the first of which
includes those whose formula matches the user's survey responses. The second
group of services include those which do not have a formula. Both groups of
services are ordered based on the overall rank of services. For each service,
relevant information is displayed, and the user has the opportunity to select
services to be used in the Report feature.

### Data

Information about the services and the order that they should appear in this
feature is stored in Redux, accessible via the
[servicesSlice](slices/servicesSlice.js). The content defined for all services
is stored in _services_, indexed by the corresponding service key. The _rank_
defines the order that services should be displayed within each Bucket. This
service data is fetched from our API at `/api/explore/v1/catalog`, which roughly
looks like this:

```json
rank: [
  "SNAP",
  "DOL_UA",
  "DOL_PUA"
],
services: {
  DOL_PUA: {
    "enabled": true,
    "formula": "=IS_COVID"
  },
  SNAP: {
    "enabled": true,
    "formula":
  },
  DOL_UA: {
    "enabled": false,
    "formula": "=IS_EMPLOYED"
  }
},
```

## Components

The feature is implemented across the following components:

- Bucket
- SelectedServices
- Services
- ServiceCard

### Bucket

The Bucket component displays a single group of services, including a title and
additional information. It uses the [ServiceCard](./components/ServiceCard.jsx)
component (which is part of maslow-shared library) to render each service.

### SelectedServices

The SelectedServices component appears at the bottom of the Services page. As
services are selected, this fixed bar on the bottom of the screen updates to
indicate the number of services selected and provides a link to the Report
feature.

### Services

Services is the top-level component which displays two groups (buckets) of
services and a link to the ny.gov/services page (where the resident can view all
services). The two buckets contain the list of services whose formulas match the
user's survey responses and the list of services without a formula. Each of
these groups are displayed as part of the Bucket component. When a service is
selected to be part of the Report, it is so indicated within the
SelectedServices component, which is also displayed on this page.

### ServiceCard

ServiceCard is the component which displays information about the specified
service. It includes a header, category, short description, an expandable
accordion with additional information and a button to toggle whether the service
is saved to the report.
