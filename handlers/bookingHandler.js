const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const catchAsync = require('./../utils/catchAsync');
const BookingModel = require('./../models/bookingModel');
const factoryFunctions = require('./factoryFunctions');

exports.createSession = catchAsync(async (req, res, next) => {
    const { user, tour } = req;
    const { success_url, cancel_url } = req.body;

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        customer_email: user.email,
        client_reference_id: tour.id,
        // success_url: `http://localhost:8000/api/v1/bookings/create-booking-for-stripe?tour=${tour.id}&user=${user.id}&price=${tour.price}`,
        // success_url: `http://localhost:3000/createBooking/tour/${tour.id}/user/${user.id}/price/${tour.price}`,
        success_url,
        cancel_url,
        line_items: [
            {
                amount: tour.price * 100,
                quantity: 1,
                currency: 'usd',
                images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
                name: `${tour.name} Tour`,
                description: tour.summary
            }
        ]
    });

    res.status(200).json({
        status: 'Success',
        session
    });
});

exports.createBookingForStripe = catchAsync(async (req, res) => {
    const { tour, user, price } = req.query.params;
    const booking = await BookingModel.create({ tour, user, price });
    res.status(200).json({
        status: 'Success',
        data: booking
    });
});

exports.getMyBookedTours = catchAsync(async (req, res, next) => {
    //    1) Get all bookings by user id
    const allBookings = await BookingModel.find({ user: req.user.id });

    //    2) Get all the tours from bookings
    const myTours = allBookings.map(booking => booking.tour);

    res.status(200).json({
        status: 'Success',
        data: myTours
    });
});

exports.createBookingByTourAndUser = catchAsync(async (req, res) => {
    const booking = await BookingModel.create({
        price: req.tour.price,
        user: req.user.id,
        tour: req.tour.id
    });
    res.status(200).json({
        status: 'Success',
        data: booking
    });
});

exports.checkBody = factoryFunctions.checkBody();
exports.getAllBookings = factoryFunctions.getAll(BookingModel);
exports.getBookingById = factoryFunctions.getOne(BookingModel);
exports.createBooking = factoryFunctions.createOne(BookingModel);
exports.updateBooking = factoryFunctions.updateOne(BookingModel);
exports.deleteBooking = factoryFunctions.deleteOne(BookingModel);
