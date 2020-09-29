/** Code adapted from Chevrotain calculator example:
 * https://github.com/SAPchevrotain/tree/master/examples/grammars/calculator/
 */

import lexer from "./lexer";
import { CstParser } from "chevrotain";

const tokenVocabulary = lexer.tokenVocabulary;

const {
  AdditionOperator,
  MultiplicationOperator,
  Pow,
  NumberLiteral,
  LParen,
  RParen,
  Comma,
  FunctionName,
  RelationalOperator,
  BooleanLiteral,
  Identifier,
} = tokenVocabulary;

class Evaluator extends CstParser {
  constructor() {
    super(tokenVocabulary);

    const $ = this;

    $.RULE("expression", () => {
      $.SUBRULE($.relationalExpression);
    });

    // Lowest precedence thus it is first in the rule chain
    // The precedence of binary expressions is determined by how far down the
    // Parse Tree the binary expression appears.
    $.RULE("relationalExpression", () => {
      $.SUBRULE($.additionExpression, { LABEL: "lhs" });
      $.MANY(() => {
        // consuming 'RelationalOperator' will consume Equals, GreaterThan,
        // GreaterThanOrEqual, LessThan, LessThanOrEqual, or NotEqual as they
        // are subclasses of RelationalOperator
        $.CONSUME(RelationalOperator);
        // the index "2" in SUBRULE2 is needed to identify the unique position
        // in the grammar during runtime
        $.SUBRULE2($.additionExpression, { LABEL: "rhs" });
      });
    });

    $.RULE("additionExpression", () => {
      $.SUBRULE($.multiplicationExpression, { LABEL: "lhs" });
      $.MANY(() => {
        // consuming 'AdditionOperator' will consume either Plus or Minus as
        // they are subclasses of AdditionOperator
        $.CONSUME(AdditionOperator);
        // the index "2" in SUBRULE2 is needed to identify the unique position
        // in the grammar during runtime
        $.SUBRULE2($.multiplicationExpression, { LABEL: "rhs" });
      });
    });

    $.RULE("multiplicationExpression", () => {
      $.SUBRULE($.powerExpression, { LABEL: "lhs" });
      $.MANY(() => {
        $.CONSUME(MultiplicationOperator);
        $.SUBRULE2($.powerExpression, { LABEL: "rhs" });
      });
    });

    $.RULE("powerExpression", () => {
      $.SUBRULE($.atomicExpression, { LABEL: "lhs" });
      $.MANY(() => {
        $.CONSUME(Pow);
        $.SUBRULE2($.atomicExpression, { LABEL: "rhs" });
      });
    });

    $.RULE("atomicExpression", () => {
      $.OPTION(() => $.CONSUME(AdditionOperator)); // support for unary minus
      $.OR([
        // parenthesisExpression has the highest precedence and thus it appears
        // in the "lowest" leaf in the expression ParseTree.
        { ALT: () => $.SUBRULE($.parenthesisExpression) },
        { ALT: () => $.CONSUME(BooleanLiteral) },
        { ALT: () => $.CONSUME(NumberLiteral) },
        { ALT: () => $.SUBRULE($.function) },
        { ALT: () => $.CONSUME(Identifier) },
      ]);
    });

    $.RULE("parenthesisExpression", () => {
      $.CONSUME(LParen);
      $.SUBRULE($.expression);
      $.CONSUME(RParen);
    });

    $.RULE("function", () => {
      $.CONSUME(FunctionName);
      $.MANY_SEP({
        SEP: Comma,
        DEF: () => {
          $.SUBRULE2($.expression, { LABEL: "param" });
        },
      });
      $.CONSUME(RParen);
    });

    this.performSelfAnalysis();
  }
}

// We only need one as the parser internal state is reset for each new input.
const parserInstance = new Evaluator();

export default {
  parserInstance: parserInstance,

  Evaluator: Evaluator,

  parse: function (inputText) {
    const lexResult = lexer.lex(inputText);

    // ".input" is a setter which will reset the parser's internal's state.
    parserInstance.input = lexResult.tokens;

    // Test parser instance.
    parserInstance.expression();

    if (parserInstance.errors.length > 0) {
      throw Error(
        "Parsing errors detected!\n" + parserInstance.errors[0].message
      );
    }
  },
};
