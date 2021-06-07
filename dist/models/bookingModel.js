"use strict";
const mongoose_1 = require("mongoose");
const bookingSchema = new mongoose_1.Schema({
    tour: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'tours',
        required: [true, 'A booking must belong a tour']
    },
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'users',
        required: [true, 'A booking must belong a user']
    },
    createdAt: {
        type: Number,
        default: Date.now()
    },
    price: {
        type: Number,
        required: [true, 'Booking must have a price']
    },
    paid: {
        type: Boolean,
        default: true
    }
});
bookingSchema.index({ user: 1, tour: 1 }, { unique: true });
bookingSchema.pre(/^find/, function (next) {
    this.populate('tour').populate({
        path: 'user',
        select: 'name email role'
    });
    next();
});
bookingSchema.pre('find', function (next) {
    this.price = this.price / 100;
    next();
});
const BookingModel = mongoose_1.model('bookings', bookingSchema);
module.exports = BookingModel;
