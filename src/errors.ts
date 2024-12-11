export class AkmjHTTPError extends Error {
  constructor(public status: number, public value: unknown) {
    super(value + "");
    this.name = "AkmjHTTPError";
    this.value = value;
  }
}

export class AkmjError extends Error {
  constructor(override message: string) {
    super(message);
    this.name = "AkmjError";
    this.message = message;
  }
}
