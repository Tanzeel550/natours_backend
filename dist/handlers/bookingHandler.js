"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBooking = exports.updateBooking = exports.createBooking = exports.getBookingById = exports.getAllBookings = exports.webHookCheckout = exports.getMyBookedTours = exports.createBookingForStripe = exports.createSession = void 0;
const catchAsync_1 = __importDefault(require("../utils/catchAsync"));
const bookingModel_1 = __importDefault(require("../models/bookingModel"));
const stripe_1 = __importDefault(require("stripe"));
const factoryFunctions = __importStar(require("./factoryFunctions"));
const AppError_1 = __importDefault(require("../utils/AppError"));
const userModel_1 = __importDefault(require("../models/userModel"));
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY);
exports.createSession = catchAsync_1.default(async (req, res, next) => {
    var _a;
    const { user, tour } = req;
    const { frontend_url } = req.body;
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        customer_email: user.email,
        client_reference_id: tour.id,
        success_url: `${frontend_url}/my-bookings`,
        cancel_url: `${frontend_url}/tour/${(_a = req.tour) === null || _a === void 0 ? void 0 : _a.id}`,
        line_items: [
            {
                amount: tour.price * 100,
                quantity: 1,
                currency: 'usd',
                images: [
                    `${req.protocol}://${req.get('host')}/img/tours/${tour.imageCover}`
                ],
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
exports.createBookingForStripe = catchAsync_1.default(async (req, res) => {
    const { tour, user, price } = req.query.params;
    const booking = await bookingModel_1.default.create({ tour, user, price });
    res.status(200).json({
        status: 'Success',
        data: booking
    });
});
exports.getMyBookedTours = catchAsync_1.default(async (req, res, next) => {
    const allBookings = await bookingModel_1.default.find({
        user: req.user.id
    });
    const myTours = allBookings.map(booking => booking.tour);
    res.status(200).json({
        status: 'Success',
        data: myTours
    });
});
const createBookingCheckout = async (sessionData) => {
    console.log(sessionData);
    const tour = sessionData.client_reference_id;
    const user = await userModel_1.default.findOne({
        email: sessionData.customer_email
    });
    if (!user) {
        throw new AppError_1.default('No user found with this id', 404);
    }
    let price = sessionData.display_items[0].amount;
    await bookingModel_1.default.create({ tour, user: user.id, price });
};
const webHookCheckout = async (req, res, next) => {
    const signature = req.headers['Stripe-signature'];
    try {
        const event = stripe.webhooks.constructEvent(req.body, signature, process.env.Stripe_WEBHOOK_SECRET);
        if (event.type === 'checkout.session.completed') {
            await createBookingCheckout(event.data.object);
            res.status(200).json({
                status: 'Success'
            });
        }
    }
    catch (e) {
        return res.status(400).send(`WebHook Error: ${e.message}`);
    }
    res.status(200).json({ received: true });
};
exports.webHookCheckout = webHookCheckout;
exports.getAllBookings = factoryFunctions.getAll(bookingModel_1.default);
exports.getBookingById = factoryFunctions.getOne(bookingModel_1.default);
exports.createBooking = factoryFunctions.createOne(bookingModel_1.default);
exports.updateBooking = factoryFunctions.updateOne(bookingModel_1.default);
exports.deleteBooking = factoryFunctions.deleteOne(bookingModel_1.default);
