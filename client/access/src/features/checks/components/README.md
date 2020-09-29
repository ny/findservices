# Checks

This folder contains a single component, `Checks.jsx`, which allows
administrative users to verify that configuration retrieved from the server is
recognized by and compatible with the frontend.

## Functionality

The Checks page validates three essential structural aspects of the server-side
configuration:

1. Each service has a well-formed formula for determining when it is shown to a
   user based on that user's survey responses.
2. Each service in the application state has a corresponding rank, so that all
   services can be displayed in rank order to users.
3. Each question key referenced by the survey sections has a corresponding
   question defined. For more information on the expected survey and question
   configuration, see [the survey README](../../survey/).

## Maslow Author

This component was developed before [Maslow Author](../../../../../author) as a
stopgap measure for validating the configuration file structure with a familiar
web-based user interface.

The initial release of Maslow Author handles the dynamic management of services,
but both question and survey structure are still statically defined in a
configuration file. As a result, the first two checks described above are
already occurring on the server side. The third check involving survey
structure is not.

If Maslow Author is expanded to include dynamic management
of questions and survey sections, then the `Checks` component will become
redundant.
