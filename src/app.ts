import express = require('express');
import dotenv from 'dotenv';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import TourRouter from './router/tourRouter';
import UserRouter from './router/userRouter';
import ReviewRouter from './router/reviewRouter';
import BookingRouter from './router/bookingsRouter';
import globalErrorController from './handlers/errorHandler';
import AppError from './utils/AppError';
import { webHookCheckout } from './handlers/bookingHandler';

dotenv.config({ path: `${__dirname}/config.env` });

// Creating the express app
const app = express();

app.use(cors());

app.post(
  '/webhook-checkout',
  express.raw({ type: 'application/json' }),
  webHookCheckout
);

if (process.env.ENVIRONMENT === 'development') {
  app.use(morgan('dev'));
}

// Global MiddleWares
app.use(express.json());

// setting up cookie parser so that we can receive the cookie
// otherwise we can only send the cookie and can never receive it back
app.use(cookieParser());

// app.use((req, res, next) => {
//     console.log(req.cookies.token);
//     next();
// });

// Serving up static files
app.use(express.static('./public/'));

app.use('/api/v1/tours', TourRouter);
app.use('/api/v1/users', UserRouter);
app.use('/api/v1/reviews', ReviewRouter);
app.use('/api/v1/bookings', BookingRouter);

// app.get('/testingRoute', authHandler.protect, (req, res) => {
//     res.status(200).json({
//         status: 'Success'
//     });
// });

app.all('*', (req, res, next) =>
  next(new AppError('This route does not exist', 404))
);

app.use(globalErrorController);

module.exports = app;
