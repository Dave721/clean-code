// noinspection JSUnusedGlobalSymbols

const Decimal = require("decimal.js");
const ValidationResult = require("./validation-result");

const Errors = {
  invalidDecimal: {
    code: "doubleNumber.e001",
    message: "The value is not a valid decimal number.",
  },
  maxDigits: {
    code: "doubleNumber.e002",
    message: "The value exceeded maximum number of digits.",
  },
  maxPlaces: {
    code: "doubleNumber.e003",
    message: "The value exceeded maximum number of decimal places.",
  },
};

const DefaultMaxDigits = 11;

/**
 * Matcher validates that string value represents a decimal number or null.
 * Decimal separator is always "."
 * In addition, it must comply to the rules described below.
 *
 * @param params - Matcher can take 0 to 2 parameters with following rules:
 * - no parameters: validates that number of digits does not exceed the maximum value of 11.
 * - one parameter: the parameter specifies maximum length of number for the above rule (parameter replaces the default value of 11)
 * - two parameters:
 *   -- first parameter represents the total maximum number of digits,
 *   -- the second parameter represents the maximum number of decimal places.
 *   -- both conditions must be met in this case.
 */
class DecimalNumberMatcher {
  constructor(...params) {
    this.params = params;
  }

  match(value) {
    let result = new ValidationResult();

    if (value) {
      const number = this._validateDecimalNumber(value, result);
      const numberOfParams = this.params.length;
      if (number) {
        this._performValidation(numberOfParams, number, value, result);
      }
    }

    return result;
  }

  _performValidation(numberOfParams, number, value, result) {
    const numberOfDigits = number.precision(true);
    switch (numberOfParams) {
      case 0:
        this._validateWithZeroParams(numberOfDigits, value, result);
        break;
      case 1:
        this._validateWithOneParam(numberOfDigits, value, result);
        break;
      case 2:
        this._validateWithTwoParams(number, numberOfDigits, value, result);
        break;
    }
  }

  _validateWithZeroParams(numberOfDigits, value, result) {
    if (numberOfDigits > DefaultMaxDigits) {
      result.addInvalidTypeError(Errors.maxDigits.code, Errors.maxDigits.message);
    }
  }

  _validateWithOneParam(numberOfDigits, value, result) {
    if (numberOfDigits > this.params[0]) {
      result.addInvalidTypeError(Errors.maxDigits.code, Errors.maxDigits.message);
    }
  }

  _validateWithTwoParams(number, numberOfDigits, value, result) {
    if (numberOfDigits > this.params[0]) {
      result.addInvalidTypeError(Errors.maxDigits.code, Errors.maxDigits.message);
    }
    if (number.decimalPlaces() > this.params[1]) {
      result.addInvalidTypeError(Errors.maxPlaces.code, Errors.maxPlaces.message);
    }
  }

  _validateDecimalNumber(value, result) {
    let decimalNumber;
    try {
      decimalNumber = new Decimal(value);
    } catch (e) {
      decimalNumber = null;
      result.addInvalidTypeError(Errors.invalidDecimal.code, Errors.invalidDecimal.message);
    }

    return decimalNumber;
  }
}

module.exports = DecimalNumberMatcher;
