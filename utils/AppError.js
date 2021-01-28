// new AppError(message, statusCode)
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        this.stack;
    }
}

module.exports = AppError;
