export type Result<T, E extends BaseError = BaseError> =
  | { success: true; data: T }
  | { success: false; error: E };

export class BaseError extends Error {
  public readonly message: string;
  public readonly cause: unknown;

  constructor(message: string, cause?: unknown) {
    super();
    this.message = message;
    this.cause = cause;
  }
}
