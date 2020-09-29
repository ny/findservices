import { evaluate } from "./actions";

describe("Parser", () => {
  it("skips whitespace", () => {
    expect(evaluate("=1 + 2").value).toEqual(evaluate("=1+2").value);
  });
  it("errors if no leading equals", () => {
    expect(() => evaluate("1 + 2").value).toThrow();
  });

  it("handles a null formula", () => {
    expect(evaluate(null).value).toBeUndefined();
  });

  it("handles an empty formula", () => {
    expect(evaluate("").value).toBeUndefined();
  });
});

describe("Literals", () => {
  it("can be signed numbers", () => {
    expect(evaluate("=2").value).toEqual(2);
    expect(evaluate("=+2").value).toEqual(2);
    expect(evaluate("=-2").value).toEqual(-2);
    expect(evaluate("=-2.").value).toEqual(-2);
  });

  it("can be decimal numbers", () => {
    expect(evaluate("=45.2").value).toBeCloseTo(45.2);
    expect(evaluate("=-45.2").value).toBeCloseTo(-45.2);
    expect(evaluate("=0.2").value).toBeCloseTo(0.2);
    expect(evaluate("=.2").value).toBeCloseTo(0.2);
  });
  it("can be boolean values", () => {
    expect(evaluate("=TRUE").value).toEqual(true);
    expect(evaluate("=FALSE").value).toEqual(false);
  });
  it("cast to integer when negative sign is used", () => {
    // Incredulously, this is valid in Google Sheets.
    expect(evaluate("=-TRUE").value).toEqual(-1);
  });
  it("maintain type when positive sign is used", () => {
    expect(evaluate("=+TRUE").value).toEqual(true);
  });
});

describe("Expressions", () => {
  describe("with addition operators", () => {
    it("can add", () => {
      expect(evaluate("=1 + 2").value).toEqual(3);
    });
    it("can subtract", () => {
      expect(evaluate("=1 - 2").value).toEqual(-1);
    });
    it("work with explicitly signed numbers", () => {
      expect(evaluate("=1 ++2").value).toEqual(3);
      expect(evaluate("=1 +-2").value).toEqual(-1);
      expect(evaluate("=1--2").value).toEqual(3);
    });
  });
  describe("with multiplication operators", () => {
    it("can multiply", () => {
      expect(evaluate("=6*3").value).toEqual(18);
    });
    it("can divide", () => {
      expect(evaluate("=8/4").value).toEqual(2);
    });
    describe("can raise to a power", () => {
      it("with a numeric exponent", () => {
        expect(evaluate("=2^2").value).toEqual(4);
      });
      it("evaluating the exponent first", () => {
        expect(evaluate("=2^5^2").value).toEqual(33554432);
      });
      it("with a parenthesized base", () => {
        expect(evaluate("=(2^5)^2").value).toEqual(1024);
      });
    });
  });
  describe("with relational operators", () => {
    describe("containing an equals sign", () => {
      it("work properly", () => {
        expect(evaluate("=1 = 2").value).toEqual(false);
        expect(evaluate("=1 = 1").value).toEqual(true);
      });
      it("work with more than 2 arguments", () => {
        expect(evaluate("=1=1=2").value).toEqual(false);
        expect(evaluate("=1=1=1").value).toEqual(true);
      });
    });
    describe("containing a greater than sign", () => {
      it("work properly", () => {
        expect(evaluate("=2 > 1").value).toEqual(true);
        expect(evaluate("=1 > 1").value).toEqual(false);
        expect(evaluate("=1 > 2").value).toEqual(false);
      });
      it("work with more than 2 arguments", () => {
        expect(evaluate("=2 > 1 > 6").value).toEqual(false);
        expect(evaluate("=6 > 3 > 1").value).toEqual(true);
      });
    });
    describe("containing a greater than or equals sign", () => {
      it("work properly", () => {
        expect(evaluate("=2 >= 1").value).toEqual(true);
        expect(evaluate("=1 >= 1").value).toEqual(true);
        expect(evaluate("=1 >= 2").value).toEqual(false);
      });
      it("work with more than 2 arguments", () => {
        expect(evaluate("=2 >= 1 >= 1").value).toEqual(true);
        expect(evaluate("=2 >= 0 >= 2").value).toEqual(false);
      });
    });
    describe("containing a less then sign", () => {
      it("work properly", () => {
        expect(evaluate("=1 < 2").value).toEqual(true);
        expect(evaluate("=1 < 1").value).toEqual(false);
        expect(evaluate("=2 < 1").value).toEqual(false);
      });
      it("work with more than 2 arguments", () => {
        expect(evaluate("=2 < 1 < 3").value).toEqual(false);
        expect(evaluate("=2 < 3 < 5").value).toEqual(true);
      });
    });
    describe("containing a less then or equals sign", () => {
      it("work properly", () => {
        expect(evaluate("=1 <= 2").value).toEqual(true);
        expect(evaluate("=1 <= 1").value).toEqual(true);
        expect(evaluate("=2 <= 1").value).toEqual(false);
      });
      it("work with more than 2 arguments", () => {
        expect(evaluate("=2 <= 1 <= 3").value).toEqual(false);
        expect(evaluate("=2 <= 3 <= 5").value).toEqual(true);
      });
    });
    describe("containing a not equals sign", () => {
      it("work properly", () => {
        expect(evaluate("=1 <> 2").value).toEqual(true);
        expect(evaluate("=1 <> 1").value).toEqual(false);
        expect(evaluate("=2 <> 1").value).toEqual(true);
      });
      it("work with more than 2 arguments", () => {
        expect(evaluate("=2 <> 1 <> 3").value).toEqual(true);
        expect(evaluate("=2 <> 2 <> 5").value).toEqual(true);
      });
    });
  });
  describe("with logic function", () => {
    describe("AND", () => {
      it("work properly", () => {
        expect(evaluate("=AND(TRUE,FALSE)").value).toEqual(false);
        expect(evaluate("=AND(TRUE,TRUE)").value).toEqual(true);
      });
      it("work with more than two arguments", () => {
        expect(evaluate("=AND(TRUE,FALSE,TRUE)").value).toEqual(false);
        expect(evaluate("=AND(TRUE,TRUE,TRUE)").value).toEqual(true);
      });
      it("work with one argument", () => {
        expect(evaluate("=AND(TRUE)").value).toEqual(true);
      });
      it("handle signed modifiers properly", () => {
        expect(evaluate("=+AND(TRUE,FALSE)").value).toEqual(false);
        expect(evaluate("=-AND(TRUE,TRUE)").value).toEqual(-1);
      });
      it("implicitly convert integers to booleans", () => {
        expect(evaluate("=AND(1,0)").value).toEqual(false);
        expect(evaluate("=AND(1,1)").value).toEqual(true);
      });
    });
    describe("OR", () => {
      it("work properly", () => {
        expect(evaluate("=OR(TRUE,FALSE)").value).toEqual(true);
        expect(evaluate("=OR(TRUE,TRUE)").value).toEqual(true);
        expect(evaluate("=OR(FALSE,FALSE)").value).toEqual(false);
      });
      it("work with more than two arguments", () => {
        expect(evaluate("=OR(FALSE,FALSE,TRUE)").value).toEqual(true);
        expect(evaluate("=OR(FALSE,FALSE,FALSE)").value).toEqual(false);
      });
      it("work with one argument", () => {
        expect(evaluate("=OR(TRUE)").value).toEqual(true);
      });
      it("handle signed modifiers properly", () => {
        expect(evaluate("=+OR(TRUE,FALSE)").value).toEqual(true);
        expect(evaluate("=-OR(TRUE,TRUE)").value).toEqual(-1);
      });
      it("implicitly convert integers to booleans", () => {
        expect(evaluate("=OR(1,0)").value).toEqual(true);
        expect(evaluate("=OR(1,1)").value).toEqual(true);
      });
    });
    describe("XOR", () => {
      it("work properly", () => {
        expect(evaluate("=XOR(TRUE,FALSE)").value).toEqual(true);
        expect(evaluate("=XOR(TRUE,TRUE)").value).toEqual(false);
        expect(evaluate("=XOR(FALSE,FALSE)").value).toEqual(false);
      });
      it("work with more than two arguments", () => {
        expect(evaluate("=XOR(FALSE,FALSE,TRUE)").value).toEqual(true);
        expect(evaluate("=XOR(TRUE,FALSE,FALSE)").value).toEqual(true);
        expect(evaluate("=XOR(TRUE,FALSE,TRUE)").value).toEqual(false);
      });
      it("work with one argument", () => {
        expect(evaluate("=XOR(TRUE)").value).toEqual(true);
      });
      it("handle signed modifiers properly", () => {
        expect(evaluate("=+XOR(TRUE,FALSE)").value).toEqual(true);
        expect(evaluate("=-XOR(TRUE,TRUE)").value).toBeCloseTo(0);
      });
      it("implicitly convert integers to booleans", () => {
        expect(evaluate("=XOR(1,0)").value).toEqual(true);
        expect(evaluate("=XOR(1,1)").value).toEqual(false);
      });
    });
    describe("NOT", () => {
      it("work properly", () => {
        expect(evaluate("=NOT(TRUE)").value).toEqual(false);
        expect(evaluate("=NOT(FALSE)").value).toEqual(true);
      });
      it("handle signed modifiers properly", () => {
        expect(evaluate("=+NOT(TRUE)").value).toEqual(false);
        expect(evaluate("=-NOT(TRUE)").value).toBeCloseTo(0);
      });
      it("implicitly convert integers to booleans", () => {
        expect(evaluate("=NOT(0)").value).toEqual(true);
        expect(evaluate("=NOT(1)").value).toEqual(false);
      });
    });
  });
  describe("preserve ordering of", () => {
    it("multiplication over addition", () => {
      // if it was evaluated left to right without taking into account precedence
      // the result would have been 9
      expect(evaluate("=1 + 2 * 3").value).toEqual(7);
    });
    it("parentheses", () => {
      expect(evaluate("=(1 + 2) * 3").value).toEqual(9);
    });
    it("parenthesized expressions that are signed", () => {
      expect(evaluate("=-(1 + 2) * 3").value).toEqual(-9);
      expect(evaluate("=+(1 + 2) * 3").value).toEqual(9);
      expect(evaluate("=6++(1 + 2) * 3").value).toEqual(15);
    });
    it("arithmatic over logical operators", () => {
      expect(evaluate("=(1 + 2) * 3 = 9").value).toEqual(true);
      expect(evaluate("=(1 + 2) * 3 = 9 + 1").value).toEqual(false);
      expect(evaluate("=(1 + 2) * 3 >= 8 + 1").value).toEqual(true);
    });
    it("multi-layered parentheses", () => {
      expect(evaluate("=((((666))))").value).toEqual(666);
    });
    it("chained expressions", () => {
      expect(evaluate("=AND(1+2=3, OR(1=1,1=2))").value).toEqual(true);
    });
  });
});

describe("Number function", () => {
  describe("SIGN", () => {
    it("extracts signs", () => {
      expect(evaluate("=SIGN(99)").value).toEqual(1);
      expect(evaluate("=SIGN(-200/10)").value).toEqual(-1);
    });
    it("extracts sign correctly for zero", () => {
      expect(evaluate("=SIGN(0)").value).toEqual(0);
    });
    it("implicitly casts from boolean to number", () => {
      expect(evaluate("=SIGN(FALSE)").value).toEqual(0);
    });
  });
  describe("ABS", () => {
    it("calculates absolute value", () => {
      expect(evaluate("=ABS(-26)").value).toEqual(26);
      expect(evaluate("=ABS(3.68)").value).toBeCloseTo(3.68);
    });
    it("evaluates nested expressions", () => {
      expect(evaluate("=ABS(-6/3)").value).toEqual(2);
    });
    it("implicitly casts from boolean to number", () => {
      expect(evaluate("=ABS(FALSE)").value).toEqual(0);
    });
    it("fails when not passed any parameters", () => {
      expect(() => evaluate("=ABS()").value).toThrow();
    });
  });
  describe("ROUND", () => {
    it("rounds numbers to the nearest integer by default", () => {
      expect(evaluate("=ROUND(826.4)").value).toEqual(826);
      expect(evaluate("=ROUND(826.645)").value).toEqual(827);
    });
    it("rounds numbers to the specified places", () => {
      expect(evaluate("=ROUND(826.645,0)").value).toEqual(827);
      expect(evaluate("=ROUND(826.645,1)").value).toBeCloseTo(826.6, 5);
      expect(evaluate("=ROUND(826.645,2)").value).toBeCloseTo(826.65, 5);
      expect(evaluate("=ROUND(826.645,3)").value).toBeCloseTo(826.645, 5);
    });
    it("rounds numbers correctly with negative places", () => {
      expect(evaluate("=ROUND(826.645,-1)").value).toEqual(830);
      expect(evaluate("=ROUND(826.645,-2)").value).toEqual(800);
    });
    it("casts arguments to integers", () => {
      expect(evaluate("=ROUND(FALSE)").value).toEqual(0);
      expect(evaluate("=ROUND(826.645,FALSE)").value).toEqual(827);
    });
  });
  describe("CEILING", () => {
    it("rounds numbers up to the nearest integer by default", () => {
      expect(evaluate("=CEILING(126.2)").value).toEqual(127);
      expect(evaluate("=CEILING(126.85)").value).toEqual(127);
    });
    it("rounds numbers up to the specified factor", () => {
      expect(evaluate("=CEILING(126.85,1)").value).toEqual(127);
    });
    it("rounds numbers up correctly with decimal factors", () => {
      expect(evaluate("=CEILING(126.85,0.1)").value).toBeCloseTo(126.9, 5);
    });
    it("rounds numbers up correctly with integer factors", () => {
      expect(evaluate("=CEILING(126.85,2)").value).toEqual(128);
      expect(evaluate("=CEILING(126.85,10)").value).toEqual(130);
      expect(evaluate("=CEILING(126.85,100)").value).toEqual(200);
    });
    it("casts arguments to integers", () => {
      expect(evaluate("=CEILING(FALSE)").value).toEqual(0);
      expect(evaluate("=CEILING(126.85,TRUE)").value).toEqual(127);
    });
    it("throws when no arguments are passed", () => {
      expect(() => evaluate("=CEILING()").value).toThrow();
    });
  });
  describe("FLOOR", () => {
    it("rounds numbers down to the nearest integer by default", () => {
      expect(evaluate("=FLOOR(126.2)").value).toEqual(126);
      expect(evaluate("=FLOOR(126.85)").value).toEqual(126);
    });
    it("rounds numbers down to the specified factor", () => {
      expect(evaluate("=FLOOR(126.85,1)").value).toEqual(126);
    });
    it("rounds numbers down correctly with decimal factors", () => {
      expect(evaluate("=FLOOR(126.85,0.1)").value).toBeCloseTo(126.8, 5);
    });
    it("rounds numbers down correctly with integer factors", () => {
      expect(evaluate("=FLOOR(126.85,2)").value).toEqual(126);
      expect(evaluate("=FLOOR(126.85,10)").value).toEqual(120);
      expect(evaluate("=FLOOR(126.85,100)").value).toEqual(100);
    });
    it("casts arguments to integers", () => {
      expect(evaluate("=FLOOR(FALSE)").value).toEqual(0);
      expect(evaluate("=FLOOR(126.85,TRUE)").value).toEqual(126);
    });
    it("throws when no arguments are passed", () => {
      expect(() => evaluate("=FLOOR()").value).toThrow();
    });
  });
  describe("INT", () => {
    it("rounds numbers down to the nearest integer", () => {
      expect(evaluate("=INT(6.18)").value).toEqual(6);
      expect(evaluate("=INT(10)").value).toEqual(10);
      expect(evaluate("=INT(2.79)").value).toEqual(2);
    });
    it("correctly rounds negative numbers down to the nearest integer", () => {
      expect(evaluate("=INT(-6.18)").value).toEqual(-7);
      expect(evaluate("=INT(-2.79)").value).toEqual(-3);
    });
    it("casts arguments to integers", () => {
      expect(evaluate("=INT(FALSE)").value).toEqual(0);
    });
    it("throws when no arguments are passed", () => {
      expect(() => evaluate("=INT()").value).toThrow();
    });
  });
});

describe("Conditional functions", () => {
  describe("with a single condition (IF)", () => {
    it("evaluates true condition", () => {
      expect(evaluate("=IF(TRUE,3,4)").value).toEqual(3);
    });
    it("evaluates false condition", () => {
      expect(evaluate("=IF(FALSE,3,4)").value).toEqual(4);
    });
    it("evaluates expression-based conditions", () => {
      expect(evaluate("=IF(3=4,15,12)").value).toEqual(12);
    });
    it("provides correct default 'else' value", () => {
      expect(evaluate("=IF(3=4,TRUE)").value).toEqual(false);
    });
    it("throw an error if no 'true' path is specified", () => {
      expect(() => evaluate("=IF(TRUE)").value).toThrow();
    });
    it("ignores leading equals sign (excel-style formulase)", () => {
      expect(evaluate("=IF(TRUE,FALSE,TRUE)").value).toEqual(false);
    });
  });
  describe("with multiple conditions (IFS)", () => {
    describe("evaluates a successful condition in", () => {
      it("the first pair", () => {
        expect(evaluate("=IFS(TRUE,FALSE,FALSE,TRUE)").value).toEqual(false);
      });
      it("subsequent pairs", () => {
        expect(evaluate("=IFS(FALSE,FALSE,TRUE,TRUE)").value).toEqual(true);
      });
    });
    it("fails if a condition is not provided with a result", () => {
      expect(() => evaluate("=IFS(FALSE,FALSE,TRUE)").value).toThrow();
      expect(() => evaluate("=IFS(FALSE)").value).toThrow();
    });
    it("ignores leading equals (excel-style formulas)", () => {
      expect(evaluate("=IFS(TRUE,FALSE,FALSE,TRUE)").value).toEqual(false);
      expect(evaluate("=IFS(FALSE,FALSE,TRUE,TRUE)").value).toEqual(true);
    });
  });
});

describe("Arithmetic function", () => {
  describe("POWER", () => {
    it("raises positive exponents", () => {
      expect(evaluate("=POWER(2,2)").value).toEqual(4);
    });
    it("raises negative exponents", () => {
      expect(evaluate("=1 + POWER(2,-2)").value).toBeCloseTo(1.25);
    });
    it("fails with too few arguments", () => {
      expect(() => evaluate("=1 + POWER(2)").value).toThrow();
    });
    it("ignores excess arguments", () => {
      expect(evaluate("=1 + POWER(2,2,3)").value).toEqual(5);
    });
  });
  describe("MOD", () => {
    it("performs modulus division", () => {
      expect(evaluate("=MOD(5,2)").value).toEqual(1);
      expect(evaluate("=MOD(36,6)").value).toEqual(0);
    });
    it("does not allow division by zero", () => {
      expect(() => evaluate("=MOD(10,0)").value).toThrow();
    });
    it("implicitly convert booleans to integers", () => {
      expect(() => evaluate("=MOD(FALSE)").value).toThrow();
    });
  });
  describe("PRODUCT", () => {
    it("multiplies", () => {
      expect(evaluate("=PRODUCT(1,2,3)").value).toEqual(6);
      expect(evaluate("=PRODUCT(-2,-1,1,40)").value).toEqual(80);
    });
    it("does not carry over a negative 0 from Javascript", () => {
      expect(evaluate("=PRODUCT(2,-2,6,0)").value).toEqual(0);
    });
    it("works with one argument", () => {
      expect(evaluate("=PRODUCT(10)").value).toEqual(10);
    });
    it("implicitly converts booleans to integers", () => {
      expect(evaluate("=PRODUCT(FALSE)").value).toEqual(0);
    });
  });
  describe("QUOTIENT", () => {
    it("divides", () => {
      expect(evaluate("=QUOTIENT(36,6)").value).toEqual(6);
    });
    it("truncates partial division", () => {
      expect(evaluate("=QUOTIENT(5,2)").value).toEqual(2);
    });
    it("does not carry over a negative 0 from Javascript", () => {
      expect(evaluate("=QUOTIENT(0,-2)").value).toEqual(0);
    });
    it("implicitly converts booleans to integers", () => {
      expect(evaluate("=QUOTIENT(3,TRUE)").value).toEqual(3);
    });
    it("does not allow division by zero", () => {
      expect(() => evaluate("=QUOTIENT(10,0)").value).toThrow();
      expect(() => evaluate("=QUOTIENT(10,FALSE)").value).toThrow();
    });
  });
  describe("SUM", () => {
    it("adds", () => {
      expect(evaluate("=SUM(1,2,3)").value).toEqual(6);
      expect(evaluate("=SUM(-2,-1,1,40)").value).toEqual(38);
      expect(evaluate("=SUM(2,-2,6,0)").value).toEqual(6);
    });
    it("works with one argument", () => {
      expect(evaluate("=SUM(10)").value).toEqual(10);
    });
    it("implicitly converts boolean to integer", () => {
      expect(evaluate("=SUM(FALSE)").value).toEqual(0);
    });
  });
  describe("SQRT", () => {
    it("calculates square roots", () => {
      expect(evaluate("=SQRT(4)").value).toEqual(2);
      expect(evaluate("=SQRT(16)").value).toEqual(4);
    });
    it("correctly evaluates the square root of zero", () => {
      expect(evaluate("=SQRT(0)").value).toEqual(0);
    });
    it("implicitly converts booleans to integers", () => {
      expect(evaluate("=SQRT(FALSE)").value).toEqual(0);
    });
    it("throws on negative parameters", () => {
      expect(() => evaluate("=SQRT(-6)").value).toThrow();
    });
  });
});

describe("Comparative function", () => {
  describe("MAX", () => {
    it("calculates the max of the arguments", () => {
      expect(evaluate("=MAX(1,2,3)").value).toEqual(3);
      expect(evaluate("=MAX(-2,-1,1,40)").value).toEqual(40);
    });
    it("works with one argument", () => {
      expect(evaluate("=MAX(2)").value).toEqual(2);
    });
    it("implicitly converts booleans to integers", () => {
      expect(evaluate("=MAX(FALSE)").value).toEqual(0);
    });
    it("throws with zero arguments", () => {
      expect(() => evaluate("=MAX()").value).toThrow();
    });
  });
  describe("MIN", () => {
    it("calculates the minimum of the arguments", () => {
      expect(evaluate("=MIN(1,2,3)").value).toEqual(1);
      expect(evaluate("=MIN(-2,-1,1,40)").value).toEqual(-2);
    });
    it("works with one argument", () => {
      expect(evaluate("=MIN(2)").value).toEqual(2);
    });
    it("implicitly converts booleans to integers", () => {
      expect(evaluate("=MIN(FALSE)").value).toEqual(0);
    });
    it("throws with zero arguments", () => {
      expect(() => evaluate("=MIN()").value).toThrow();
    });
  });
});

describe("Identifiers", () => {
  it("can resolve to boolean values", () => {
    expect(evaluate("=IS_EMPLOYED", { IS_EMPLOYED: true }).value).toEqual(true);
    expect(evaluate("=IS_EMPLOYED", { IS_EMPLOYED: false }).value).toEqual(
      false
    );
  });

  it("can resolve to integer values", () => {
    expect(evaluate("=HOUSEHOLD_SIZE", { HOUSEHOLD_SIZE: 4 }).value).toEqual(4);
    expect(
      evaluate("=HOUSEHOLD_INCOME", { HOUSEHOLD_INCOME: 1000 }).value
    ).toEqual(1000);
  });

  it("resolve ones we don't expect (but are provided)", () => {
    expect(evaluate("=DICE_ROLL", { DICE_ROLL: 20 }).value).toEqual(20);
  });

  it("throw when non-existent", () => {
    expect(() => evaluate("=DOES_NOT_EXIST").value).toThrow();
  });
});
