/** Code adapted from Chevrotain calculator example:
 * https://github.com/SAPchevrotain/tree/master/examples/grammars/calculator/
 */

import { createToken, Lexer } from "chevrotain";

// Must handle the following mathematical operators:
// ADD (+), DIVIDE (/), EQ (=), GT (>), GTE (>=), LT (<), LTE (<=), MINUS (-),
// MULTIPLY (*), NE (<>), POW (^), UMINUS (-), PARANTHESES (())
// and logical expressions:
// AND, FALSE, IF, IFS, NOT, OR, TRUE, XOR
// as well as identifiers for equations:
// NumberLiteral, Identifier (variable like HOUSEHOLD_SIZE)

// using the NA pattern marks this Token class as 'irrelevant' for the Lexer.
// AdditionOperator defines a Tokens hierarchy but only the leafs in this hierarchy define actual Tokens that can appear in the text
const AdditionOperator = createToken({
  name: "AdditionOperator",
  pattern: Lexer.NA,
});
const Plus = createToken({
  name: "Plus",
  pattern: /\+/,
  categories: AdditionOperator,
});
const Minus = createToken({
  name: "Minus",
  pattern: /-/,
  categories: AdditionOperator,
});

const MultiplicationOperator = createToken({
  name: "MultiplicationOperator",
  pattern: Lexer.NA,
});
const Multi = createToken({
  name: "Multi",
  pattern: /\*/,
  categories: MultiplicationOperator,
});
const Div = createToken({
  name: "Div",
  pattern: /\//,
  categories: MultiplicationOperator,
});

const Pow = createToken({
  name: "Pow",
  pattern: /\^/,
});

const LParen = createToken({ name: "LParen", pattern: /\(/ });
const RParen = createToken({ name: "RParen", pattern: /\)/ });
const NumberLiteral = createToken({
  name: "NumberLiteral",
  // Leading zeros are permitted because excluding them would require regex
  // anchor tags, which the lexer disallows.
  pattern: /(\.\d+|\d+(\.\d*)?)/,
});

const Comma = createToken({ name: "Comma", pattern: /,/ });

// RelationalOperators
const RelationalOperator = createToken({
  name: "RelationalOperator",
  pattern: Lexer.NA,
});
const Equals = createToken({
  name: "Equals",
  pattern: /=/,
  categories: RelationalOperator,
});
const GreaterThan = createToken({
  name: "GreaterThan",
  pattern: />/,
  categories: RelationalOperator,
});
const GreaterThanOrEqual = createToken({
  name: "GreaterThanOrEqual",
  pattern: />=/,
  categories: RelationalOperator,
});
const LessThan = createToken({
  name: "LessThan",
  pattern: /</,
  categories: RelationalOperator,
});
const LessThanOrEqual = createToken({
  name: "LessThanOrEqual",
  pattern: /<=/,
  categories: RelationalOperator,
});
const NotEqual = createToken({
  name: "NotEqual",
  pattern: /<>/,
  categories: RelationalOperator,
});

const BooleanLiteral = createToken({
  name: "BooleanLiteral",
  pattern: /(TRUE|FALSE)/,
});

// ------------------ FUNCTIONS ------------------
const FunctionName = createToken({
  name: "FunctionName",
  pattern: /[A-Z]+\(/,
});

const Identifier = createToken({
  name: "Identifier",
  pattern: /[A-Z0-9_]{1,250}/,
});

// marking WhiteSpace as 'SKIPPED' makes the lexer skip it.
const WhiteSpace = createToken({
  name: "WhiteSpace",
  pattern: /\s+/,
  group: Lexer.SKIPPED,
});

// NOTE: The lexer will assign string fragments to tokens using the order of
// the rules in this array. The length or complexity of rules is not relevant.
const allTokens = [
  WhiteSpace, // Place first for performance (whitespace is most common)
  Plus,
  Minus,
  Multi,
  Div,
  LParen,
  RParen,
  NumberLiteral,
  AdditionOperator,
  MultiplicationOperator,
  Pow,
  Comma,
  RelationalOperator,
  Equals,
  NotEqual,
  GreaterThanOrEqual,
  GreaterThan,
  LessThanOrEqual,
  LessThan,
  BooleanLiteral,
  FunctionName,
  Identifier,
];

const EvaluatorLexer = new Lexer(allTokens);

export default {
  tokenVocabulary: allTokens.reduce((tokenVocabulary, tokenType) => {
    tokenVocabulary[tokenType.name] = tokenType;
    return tokenVocabulary;
  }, {}),

  lex: function (inputText) {
    const lexingResult = EvaluatorLexer.tokenize(inputText);

    if (lexingResult.errors.length > 0) {
      var errorMessage = "Errors were found while tokenizing input:\n";
      for (let error of lexingResult.errors) {
        errorMessage = errorMessage.concat("\t", error.message);
      }
      throw Error(errorMessage);
    }

    return lexingResult;
  },
};
