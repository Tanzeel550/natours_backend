// new AppError(message, statusCode)
class AppError extends Error {
	public statusCode: any;
	public isOperational: any;
	public stack: any;

  constructor(message, statusCode?) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.stack;
  }
}

module.exports = AppError;
