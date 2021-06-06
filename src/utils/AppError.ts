// new AppError(message, statusCode)
class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public stack: any;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

export = AppError;
