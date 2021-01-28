const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const catchAsync = require('./../utils/catchAsync');
const BookingModel = require('./../models/bookingModel');
const factoryFunctions = require('./factoryFunctions');
const UserModel = require('./../models/userModel');

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
                images: [`${req.protocol}://${req.get('host')}/img/tours/${tour.imageCover}`],
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

// exports.createBookingByTourAndUser = catchAsync(async (req, res) => {
//     const booking = await BookingModel.create({
//         price: req.tour.price,
//         user: req.user.id,
//         tour: req.tour.id
//     });
//     res.status(200).json({
//         status: 'Success',
//         data: booking
//     });
// });

const createBookingCheckout = async sessionData => {
    console.log(sessionData);
    const tour = sessionData.client_reference_id;
    const user = await UserModel.findOne({ email: sessionData.customer_email }).id;
    // const price = sessionData.line_items[0].amount / 100;
    const price = sessionData.amount_total / 100;
    await BookingModel.create({ tour, user, price });
};

exports.webhookCheckout = async (req, res, next) => {
    const signature = req.headers['stripe-signature'];

    let event;
    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (e) {
        return res.status(400).send(`Webhook Error: ${e.message}`);
    }

    if (event.type === 'checkout.session.completed') {
        await createBookingCheckout(event.data.object);
    }
    res.status(200).json({ received: true });
};

exports.checkBody = factoryFunctions.checkBody();
exports.getAllBookings = factoryFunctions.getAll(BookingModel);
exports.getBookingById = factoryFunctions.getOne(BookingModel);
exports.createBooking = factoryFunctions.createOne(BookingModel);
exports.updateBooking = factoryFunctions.updateOne(BookingModel);
exports.deleteBooking = factoryFunctions.deleteOne(BookingModel);
