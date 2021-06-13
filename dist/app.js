"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const morgan_1 = __importDefault(require("morgan"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const tourRouter_1 = __importDefault(require("./router/tourRouter"));
const userRouter_1 = __importDefault(require("./router/userRouter"));
const reviewRouter_1 = __importDefault(require("./router/reviewRouter"));
const bookingsRouter_1 = __importDefault(require("./router/bookingsRouter"));
const errorHandler_1 = __importDefault(require("./handlers/errorHandler"));
const AppError_1 = __importDefault(require("./utils/AppError"));
const bookingHandler_1 = require("./handlers/bookingHandler");
const path_1 = __importDefault(require("path"));
const app = express_1.default();
app.use(cors_1.default());
app.post('/webhook-checkout', express_1.default.raw({ type: 'application/json' }), bookingHandler_1.webHookCheckout);
if (process.env.ENVIRONMENT === 'development') {
    app.use(morgan_1.default('dev'));
}
app.use(express_1.default.json());
app.use(cookie_parser_1.default());
app.use(express_1.default.static(path_1.default.join(__dirname, 'public')));
app.use('/api/v1/tours', tourRouter_1.default);
app.use('/api/v1/users', userRouter_1.default);
app.use('/api/v1/reviews', reviewRouter_1.default);
app.use('/api/v1/bookings', bookingsRouter_1.default);
app.all('*', (req, res, next) => next(new AppError_1.default('This route does not exist', 404)));
app.use(errorHandler_1.default);
module.exports = app;
