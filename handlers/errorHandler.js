const chalk = require('chalk');

const devErrors = (error, res) => {
    return res.status(error.statusCode).json({
        status: 'Error',
        message: error.message,
        error,
        stack: error.stack
    });
};

let globalRes;

const prodErrors = (errorCode, message) => {
    globalRes.status(errorCode).json({
        status: 'Error',
        message: message || 'Something very bad has happened!'
    });
};

const tourValidationError = error => {
    let validationErrorFields = [];
    Object.keys(error.errors).forEach(value => validationErrorFields.push(value));
    validationErrorFields = validationErrorFields.join(', ');
    return prodErrors(error.statusCode, `The Fields '${validationErrorFields}' are required`);
};

const jsonParsingError = ({ statusCode }) => prodErrors(statusCode, 'Your JSON is inaccurate');

const objectIdValidationError = ({ statusCode }) =>
    prodErrors(statusCode, 'You have provided Invalid ID!');

const usersValidationError = error => {
    const err = Object.values(error)[0];
    globalRes.status(error.statusCode).json({
        status: 'Error',
        message: err
    });
};

const invalidBodyError = ({ statusCode }) => {
    return prodErrors(statusCode, 'You have provided invalid body');
};

// err -> AppError
globalErrorController = (error, req, res, next) => {
    error.isOperational = error.isOperational || false;
    error.statusCode = error.statusCode || 404;

    //    We only need to handle errors in Production
    //    In Development errors, we only need to send the errors as a response

    console.log(chalk.red.bold('An Error Occurred: ', error.message));
    console.error('ERROR👹👹👹👹👹', error);
    if (process.env.ENVIRONMENT === 'development') {
        devErrors(error, res);
    } else {
        globalRes = res;
        if (error._message === 'tours validation failed') {
            return tourValidationError(error);
        }
        if (error._message === 'users validation failed') {
            return usersValidationError(error, res);
        }
        if (error.type === 'entity.parse.failed') {
            return jsonParsingError(error);
        }
        if (error.kind === 'ObjectId') {
            return objectIdValidationError(error);
        }
        if (error.message === 'body is not iterable') {
            return invalidBodyError(error);
        }

        prodErrors(error.statusCode);
    }
};

module.exports = globalErrorController;
