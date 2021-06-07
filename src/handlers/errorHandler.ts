import AppError from '../utils/AppError';
import { ErrorRequestHandler, NextFunction, Request, Response } from 'express';
import { MongoError } from 'mongodb';

const handleCastErrorDB = (err: any): AppError => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err: any): AppError => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  console.log(value);

  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err: any): AppError => {
  const errors = Object.values(err.errors).map((el: any) => el.message);

  const message = `Invalid input data. Please correct your following inputs ${errors.join(
    ', '
  )}`;
  return new AppError(message, 400);
};

const handleJWTError = (): AppError =>
  new AppError('Invalid credentials. Please log in again!', 401);

const handleJWTExpiredError = (): AppError =>
  new AppError('Your login session has expired! Please log in again.', 401);

const handleMongoError = (error: any): AppError => {
  return new AppError(
    `${error.keyValue.email} already exists. Please try a new one`,
    404
  );
};

const sendErrorDev = (err: AppError, req: Request, res: Response) => {
  return res.status(err.statusCode).json({
    status: err.statusCode,
    error: err,
    message: err.message,
    stack: err.stack
  });
};

const sendErrorProd = (err: AppError, req: Request, res: Response) => {
  // A) Operational, trusted error: send message to client
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.statusCode,
      message: err.message
    });
  }
  // B) Programming or other unknown error: don't leak error details
  // 1) Log error
  console.error('ERROR 💥', err);
  // 2) Send generic message
  return res.status(500).json({
    status: 'Error',
    message: 'Something went very wrong!'
  });
};

// Note: your error handler middleware MUST have 4 parameters: error, req, res, next. Otherwise your handler won't fire.
const errorHandler: ErrorRequestHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || 'Error';

  if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;

    if (error.name === 'MongoError' && error.code === 11000)
      error = handleMongoError(error);
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.statusCode === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();
    if (error.message === 'users validation failed')
      error = handleValidationErrorDB(error);

    sendErrorProd(error, req, res);
  } else {
    sendErrorDev(err, req, res);
  }
};

export = errorHandler;
