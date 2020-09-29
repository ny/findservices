/** Code adapted from Chevrotain calculator example:
 * https://github.com/SAPchevrotain/tree/master/examples/grammars/calculator/
 */

import lexer from "./lexer";
import parser from "./parser";
import evaluateFunction from "./functions";
import { tokenMatcher } from "chevrotain";
import _ from "lodash";

const Evaluator = parser.Evaluator;
const { tokenVocabulary, lex } = lexer;
const {
  Plus,
  Minus,
  Multi,
  Equals,
  GreaterThan,
  GreaterThanOrEqual,
  LessThan,
  LessThanOrEqual,
  NotEqual,
} = tokenVocabulary;

// A new parserInstance instance with CST output (enabled by default).
const parserInstance = new Evaluator([]);

const BaseCstVisitor = parserInstance.getBaseCstVisitorConstructor();

class EvaluatorInterpreter extends BaseCstVisitor {
  constructor(responses) {
    super();
    this.responses = responses;
    // This helper will detect any missing or redundant methods on this visitor
    this.validateVisitor();
  }

  expression(ctx) {
    // visiting an array is equivalent to visiting its first element.
    return this.visit(ctx.relationalExpression);
  }

  // The behavior of relational expressions is consistent with Google Sheets
  // when using two operands. For cases where there are more than two operands
  // we evaluate if each part of the statement is valid. For example, suppose
  // we are evaluating:
  //
  //     2 >= 0 >= 2
  //
  // Evaluating this statement in Google Sheets results in the value TRUE (which
  // is not mathematically accurate). We would evaluate this statement by
  // evaluating each pair of operands and "anding" the boolean values. Thus the
  // evaluation order here would result in:
  //
  //     2 >= 0 ----¬   >= 2
  //     (TRUE) &&  |
  //                v
  //                0   >= 2
  //     (TRUE) &&    (FALSE)
  //     FALSE
  //
  // This divergence is necessary because there will likely be cases where
  // two or more operands will be used to express a bounded range
  // (e.g. 16000 <= HOUSEHOLD_INCOME <= 50000).
  relationalExpression(ctx) {
    let lhsValue = this.visit(ctx.lhs);
    let result = null;

    // "rhs" key may be undefined as the grammar defines it as optional
    // (MANY === zero or more).
    if (ctx.rhs) {
      ctx.rhs.forEach((rhsOperand, idx) => {
        // there will be one operator for each rhs operand
        let rhsValue = this.visit(rhsOperand);
        let operator = ctx.RelationalOperator[idx];

        // To make all the logical operators below we need to set an initial
        // state, all of these except NotEqual needs to be true so we simply
        // check if the token is NotEqual.
        result = result == null ? !tokenMatcher(operator, NotEqual) : result;

        if (tokenMatcher(operator, Equals)) {
          result = result && lhsValue === rhsValue;
        } else if (tokenMatcher(operator, GreaterThan)) {
          result = result && lhsValue > rhsValue;
        } else if (tokenMatcher(operator, GreaterThanOrEqual)) {
          result = result && lhsValue >= rhsValue;
        } else if (tokenMatcher(operator, LessThan)) {
          result = result && lhsValue < rhsValue;
        } else if (tokenMatcher(operator, LessThanOrEqual)) {
          result = result && lhsValue <= rhsValue;
        } else if (tokenMatcher(operator, NotEqual)) {
          result = result || lhsValue !== rhsValue;
        }
        lhsValue = rhsValue;
      });
    }

    // If there is no right hand side operator, we are just meant to pass
    // through other values due to the rule dependencies in the parser.
    return ctx.rhs ? result : lhsValue;
  }

  additionExpression(ctx) {
    let result = this.visit(ctx.lhs);

    // "rhs" key may be undefined as the grammar defines it as optional
    // (MANY === zero or more).
    if (ctx.rhs) {
      ctx.rhs.forEach((rhsOperand, idx) => {
        // there will be one operator for each rhs operand
        let rhsValue = this.visit(rhsOperand);
        let operator = ctx.AdditionOperator[idx];

        if (tokenMatcher(operator, Plus)) {
          result += rhsValue;
        } else {
          result -= rhsValue;
        }
      });
    }

    return result;
  }

  multiplicationExpression(ctx) {
    let result = this.visit(ctx.lhs);

    // "rhs" key may be undefined as the grammar defines it as optional
    // (MANY === zero or more).
    if (ctx.rhs) {
      ctx.rhs.forEach((rhsOperand, idx) => {
        // there will be one operator for each rhs operand
        let rhsValue = this.visit(rhsOperand);
        let operator = ctx.MultiplicationOperator[idx];

        if (tokenMatcher(operator, Multi)) {
          result *= rhsValue;
        } else {
          result /= rhsValue;
        }
      });
    }

    return result;
  }

  // Power signs evaluate differently from the POWER function. The POWER
  // function only takes two arguments whereas a power expression should be able
  // to work with multiple exponents (e.g. 2^5^2).
  powerExpression(ctx) {
    let results = [this.visit(ctx.lhs)];

    // "rhs" key may be undefined as the grammar defines it as optional
    // (MANY === zero or more).
    if (ctx.rhs) {
      ctx.rhs.forEach((rhsOperand, idx) => {
        results.push(this.visit(rhsOperand));
      });
    }
    while (results.length > 1) {
      let exponent = results.pop();
      let base = results.pop();
      results.push(Math.pow(base, exponent));
    }

    return results[0];
  }

  atomicExpression(ctx) {
    var sign = 1;

    if (ctx.AdditionOperator) {
      sign = tokenMatcher(ctx.AdditionOperator[0], Minus) ? -1 : 1;
    }

    if (ctx.parenthesisExpression) {
      return sign * this.visit(ctx.parenthesisExpression);
    } else if (ctx.BooleanLiteral) {
      // We already know that BooleanLiteral is either "TRUE" or "FALSE" so no
      // need to check for both.
      const result = ctx.BooleanLiteral[0].image === "TRUE";
      if (
        ctx.AdditionOperator &&
        tokenMatcher(ctx.AdditionOperator[0], Minus)
      ) {
        // Javascript lets you just multiply by a boolean but it makes the type
        // checker cranky if you don't explicitly cast it to an integer.
        return -1 * (result ? 1 : 0);
      } else {
        return result;
      }
    } else if (ctx.NumberLiteral) {
      return sign * parseFloat(ctx.NumberLiteral[0].image);
    } else if (ctx.function) {
      const result = this.visit(ctx.function);
      // If the return value for either a function or identifier is a boolean,
      // we want to preserve the boolean-ness of it unless it is a negative.
      // This is to remain consistent with the behavior of Google Sheets.
      if (
        (!ctx.AdditionOperator ||
          tokenMatcher(ctx.AdditionOperator[0], Plus)) &&
        typeof result === "boolean"
      ) {
        return result;
      } else {
        return sign * result;
      }
    } else if (ctx.Identifier) {
      if (ctx.Identifier[0].image in this.responses) {
        const result = this.responses[ctx.Identifier[0].image];
        if (!ctx.AdditionOperator) {
          return result;
        } else {
          return sign * result;
        }
      } else {
        throw Error(
          "Errors detected!\n Unknown variable: '" +
            String(ctx.Identifier[0].image) +
            "'"
        );
      }
    }
  }

  function(ctx) {
    let params = [];
    // The function name rule matches all caps keywords with a open parentheses,
    // we strip off that last parentheses to be able to just match by keyword.
    let functionName = ctx.FunctionName[0].image.slice(0, -1);

    // "param" key may be undefined as the grammar defines it as optional
    // (MANY === zero or more).
    if (ctx.param) {
      ctx.param.forEach((param, idx) => {
        params.push(this.visit(param));
      });
    }

    return evaluateFunction(functionName, params);
  }

  parenthesisExpression(ctx) {
    // The ctx will also contain the parenthesis tokens, but we don't care about
    // those in the context of calculating the result.
    return this.visit(ctx.expression);
  }
}

/**
 * Evaluates the specified service eligibility formula, using the specified
 * dictionary of user responses, to determine if the user is potentially
 * eligible for the corresponding service.
 *
 * @param formula a string representation of the eligibility formula
 * for a single service
 * @param responses a dictionary of questionKeys to user responses,
 * indicating the responses provided by the user to each question
 */
export const evaluate = (formula, responses = {}) => {
  // 1. Check for leading equals operator and throw error if does not exist, or
  // remove if found
  if (_.isEmpty(formula)) {
    return {};
  }
  if (!_.startsWith(formula, "=")) {
    throw Error("Errors detected!\n Formula does not begin with a '='");
  }
  const formulaToParse = formula.substring(1);

  // 2. Tokenize the input.
  const lexResult = lex(formulaToParse);

  // 3. Parse the Tokens into a concrete syntax tree (CST).
  parserInstance.input = lexResult.tokens;
  const cst = parserInstance.expression();

  // 4. Perform semantics (actions) using a CstVisitor.
  // Create interpreter with responses provided
  const interpreter = new EvaluatorInterpreter(responses);
  const value = interpreter.visit(cst);

  return {
    value: value,
    lexResult: lexResult,
    parseErrors: parserInstance.errors,
  };
};
