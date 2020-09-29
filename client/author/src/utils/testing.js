// Custom Error class for throwing errors with specific message values.
export class CustomCodeErrorWithMessage extends Error {
  constructor(message, code) {
    super(message);

    this.name = "CustomCodeError";
    this.response = {
      data: {
        message: message,
        status: code,
      },
    };
  }
}
