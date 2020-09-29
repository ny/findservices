# Formulas

Many social services in the application define a formula that returns a boolean
value. When evaluated against a resident's answers to the
[survey](../../../../access/src/features/survey) questions, a formula returning
`true` indicates that the corresponding social service should be suggested to
the resident. A formula returning `false` indictes the corresponding service
should be hidden.

Some services do not have formulas, and are shown to all residents. See the
[Services](../../../../access/src/features/services) feature for more
information.

## Overview

Formulas for each social service are defined using a
[subset of functions](#supported-functions) supported by Google Sheets, with
support for variables that correspond to a resident's responses to survey
questions. The formulas are designed to be added and modified by administrative
users who may not be comfortable writing code and checking it in to an active
repository.

The formulas for each social service are currently defined in the
[`application.yaml`](../../../../../server/access/src/main/resources/application.yaml)
server configuration file. Any formula changes must be
checked in to this file.

> NOTE: Maslow Author will allow administrative users to edit formulas with a
> user interface, rather than by manually editing `application.yaml`. However,
> Maslow Author will export any changes directly into Maslow Access's
> `application.yaml` file. Migrating the service configuration to a database is
> out of scope for the initial release.

## Implementation

The `formulas` module contains all of the logic for lexing, parsing, and
evaluating the formulas using a JS parsing library called
[Chevrotain](https://sap.github.io/chevrotain/docs/).

### Lexing

The lexer's responsibility is to tokenize the formula string. It will report an
error when a formula has invalid or unsupported syntax, like trying to use dot
notation in a variable name (e.g. `my.variable.name`) when only dashes and
underscores are permitted (e.g. `my_variable-name`).

See [`lexer.js`](./lexer.js).

### Parsing

The parser defines the permitted order of tokens created by the lexer, as
specified by the formula grammar. It will report an error when all of the
symbols in the formula are valid (as determined by the lexer), but those symbols
are not defined in our grammar or are not used as defined by the grammar.

For example, `CEILING(SWITCH(IF()))` comprises a string with valid tokens. The
lexer would suceed when tokenizing the string, but the parsing stage identifies
that (1) `SWITCH` is not a supported function, and (2) that there are missing
values in the `IF` formula.

See [`parser.js`](./parser.js).

### Evaluation

Once the formula has been lexed and parsed, the final task is to compute the
boolean value described by the formula.

The parser generates a [Concrete Syntax Tree (CST)](https://sap.github.io/chevrotain/docs/tutorial/step3a_adding_actions_visitor.html#introduction).
An interpreter is defined using the visitor pattern in
[`actions.js`](./actions.js), allowing CSTs for any valid formula to be
passed into the same interpreter object to calculate the formula's value.

The actual implementation of each of the supported functions can be found in
[`functions.js`](./functions.js).

## Verifying Formulas

We have built a route into the application, `/app/checks` which you may visit in
the browser to verify that the `formulas` module successfully parses and
evaluates the formula provided for each social service.

## Supported Functions

- **Logical**: AND, FALSE, IF, IFS, NOT, OR, TRUE, XOR
- **Math**: ABS, CEILING, FLOOR, INT, MOD, POWER, PRODUCT, QUOTIENT, ROUND,
  SIGN, SUM
- **Operator**: ADD (+), DIVIDE (/), EQ (=), GT (>), GTE (>=), LT (<), LTE (<=),
  MINUS (-), MULTIPLY (\*), NE (<>), POW (^), UMINUS (-)
- **Statistical**: MAX, MIN
