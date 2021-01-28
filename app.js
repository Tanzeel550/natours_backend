const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const TourRouter = require('./router/tourRouter');
const UserRouter = require('./router/userRouter');
const ReviewRouter = require('./router/reviewRouter');
const BookingRouter = require('./router/bookingsRouter');
const globalErrorController = require('./handlers/errorHandler');
const AppError = require('./utils/AppError');
const authHandler = require('./handlers/authHandler');

dotenv.config({ path: `${__dirname}/config.env` });

// Creating the express app
const app = express();

app.use(cors());

if (process.env.ENVIRONMENT === 'development') {
    app.use(morgan('dev'));
}

// Global middlewares
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

app.all('*', (req, res, next) => next(new AppError('This route does not exist', 404)));

app.use(globalErrorController);

module.exports = app;
