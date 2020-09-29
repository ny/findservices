const checkParams = (functionName, params, minParamCount) => {
  if (params.length < minParamCount) {
    let message = "Error when calling " + functionName + "!\n\n";
    message.concat(
      "Expected at least ",
      minParamCount,
      " arguments but got ",
      params.length
    );
    throw Error(message);
  }
  return true;
};

const Functions = {
  POWER: (params) => {
    return Math.pow(params[0], params[1]);
  },
  AND: (params) => {
    let result = params[0];

    for (let i = 1; i < params.length; i++) {
      result = result && params[i];
    }

    return Boolean(result);
  },
  OR: (params) => {
    let result = params[0];

    for (let i = 1; i < params.length; i++) {
      result = result || params[i];
    }

    return Boolean(result);
  },
  NOT: (params) => {
    return !params[0];
  },
  XOR: (params) => {
    let numTrues = 0;

    for (let i = 0; i < params.length; i++) {
      numTrues += params[i] ? 1 : 0;
    }

    return !!(numTrues % 2);
  },
  IF: (params) => {
    if (params[0]) {
      return params[1];
    } else {
      return params[2] || params[0];
    }
  },
  IFS: (params) => {
    if (params.length % 2) {
      let message = "Error when calling Ifs!\n\n";
      message.concat("Expected an even number of arguments");
      throw Error(message);
    }

    for (let i = 0; i < params.length; i += 2) {
      if (params[i]) {
        return params[i + 1];
      }
    }
  },
  ABS: (params) => {
    return Math.abs(params[0]);
  },
  CEILING: (params) => {
    const unit = params[1] ? params[1] : 1;
    return Math.ceil(params[0] / unit) * unit;
  },
  FLOOR: (params) => {
    const unit = params[1] ? params[1] : 1;
    return Math.floor(params[0] / unit) * unit;
  },
  INT: (params) => {
    return Math.floor(params[0]);
  },
  MOD: (params) => {
    if (params[1] === 0) {
      throw Error("MOD function: Cannot divide by 0.");
    }
    return params[0] % params[1];
  },
  PRODUCT: (params) => {
    var result = params[0];
    for (let i = 1; i < params.length; i++) {
      result *= params[i];
    }

    // Javascript multiplication preserves negative symbols when multiplying by
    // zero which is inconsistent behavior compared to Google Sheets (and
    // arguably mathematics). 0 == -0 == false so this becomes a slick check.
    return result ? result : 0;
  },
  QUOTIENT: (params) => {
    var result = params[0];
    for (let i = 1; i < params.length; i++) {
      // We want to handle 0 or FALSE since we have dynamic type conversion.
      if (params[i] === 0 || !params[i]) {
        throw Error("QUOTIENT function: Cannot divide by 0.");
      }
      result /= params[i];
    }

    // Javascript multiplication preserves negative symbols when multiplying by
    // zero which is inconsistent behavior compared to Google Sheets (and
    // arguably mathematics). 0 == -0 == false so this becomes a slick check.
    result = Math.floor(result);
    return result ? result : 0;
  },
  ROUND: (params) => {
    const places = params[1] || 0;
    var result = params[0] * Math.pow(10, places);
    return Math.round(result) / Math.pow(10, places);
  },
  SIGN: (params) => {
    return Math.sign(params[0]);
  },
  SQRT: (params) => {
    if (params[0] < 0) {
      throw Error(
        "SQRT function: Cannot take square root of negative numbers. Instead take the negative of the result (e.g. '-SQRT(4)')."
      );
    }
    return Math.sqrt(params[0]);
  },
  SUM: (params) => {
    var result = Number(params[0]);
    for (let i = 1; i < params.length; i++) {
      result += params[i];
    }

    return result;
  },
  MAX: (params) => {
    return Math.max(...params);
  },
  MIN: (params) => {
    return Math.min(...params);
  },
};

// Format is [token, function, minimum arguments].
const dispatcher = [
  ["POWER", Functions.POWER, 2],
  ["AND", Functions.AND, 1],
  ["OR", Functions.OR, 1],
  ["NOT", Functions.NOT, 1],
  ["XOR", Functions.XOR, 1],
  ["IF", Functions.IF, 2],
  ["IFS", Functions.IFS, 2],
  ["ABS", Functions.ABS, 1],
  ["CEILING", Functions.CEILING, 1],
  ["FLOOR", Functions.FLOOR, 1],
  ["INT", Functions.INT, 1],
  ["MOD", Functions.MOD, 2],
  ["PRODUCT", Functions.PRODUCT, 1],
  ["QUOTIENT", Functions.QUOTIENT, 2],
  ["ROUND", Functions.ROUND, 1],
  ["SIGN", Functions.SIGN, 1],
  ["SQRT", Functions.SQRT, 1],
  ["SUM", Functions.SUM, 1],
  ["MAX", Functions.MAX, 1],
  ["MIN", Functions.MIN, 1],
];

const evaluateFunction = (functionName, params) => {
  const match = dispatcher.find((option) => functionName === option[0]);
  return checkParams(match[0], params, match[2]) && match[1](params);
};

export default evaluateFunction;
