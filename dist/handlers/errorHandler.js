"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const AppError_1 = __importDefault(require("../utils/AppError"));
const handleCastErrorDB = (err) => {
    const message = `Invalid ${err.path}: ${err.value}.`;
    return new AppError_1.default(message, 400);
};
const handleDuplicateFieldsDB = (err) => {
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
    console.log(value);
    const message = `Duplicate field value: ${value}. Please use another value!`;
    return new AppError_1.default(message, 400);
};
const handleValidationErrorDB = (err) => {
    const errors = Object.values(err.errors).map((el) => el.message);
    const message = `Invalid input data. Please correct your following inputs ${errors.join(', ')}`;
    return new AppError_1.default(message, 400);
};
const handleJWTError = () => new AppError_1.default('Invalid credentials. Please log in again!', 401);
const handleJWTExpiredError = () => new AppError_1.default('Your login session has expired! Please log in again.', 401);
const handleMongoError = (error) => {
    return new AppError_1.default(`${error.keyValue.email} already exists. Please try a new one`, 404);
};
const sendErrorDev = (err, req, res) => {
    console.log(err);
    return res.status(err.statusCode).json({
        status: err.statusCode,
        error: err,
        message: err.message,
        stack: err.stack
    });
};
const sendErrorProd = (err, req, res) => {
    console.log(err);
    if (err.isOperational) {
        return res.status(err.statusCode).json({
            status: err.statusCode,
            message: err.message
        });
    }
    console.error('ERROR 💥', err);
    return res.status(500).json({
        status: 'Error',
        message: 'Something went very wrong!'
    });
};
const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || 'Error';
    if (process.env.NODE_ENV === 'production') {
        let error = { ...err };
        error.message = err.message;
        if (error.name === 'MongoError' && error.code === 11000)
            error = handleMongoError(error);
        if (error.name === 'CastError')
            error = handleCastErrorDB(error);
        if (error.statusCode === 11000)
            error = handleDuplicateFieldsDB(error);
        if (error.name === 'ValidationError')
            error = handleValidationErrorDB(error);
        if (error.name === 'JsonWebTokenError')
            error = handleJWTError();
        if (error.name === 'TokenExpiredError')
            error = handleJWTExpiredError();
        if (error.message === 'users validation failed')
            error = handleValidationErrorDB(error);
        sendErrorProd(error, req, res);
    }
    else {
        sendErrorDev(err, req, res);
    }
};
module.exports = errorHandler;
