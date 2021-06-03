const express = require('express');
const authHandler = require('./../handlers/authHandler');
const tourHandler = require('./../handlers/tourHandler');
const bookingHandler = require('../handlers/bookingHandler');

const bookingsRouter = express.Router({
  mergeParams: true
});

// This tour is specially for creating bookings because it is called by stripe
// bookingsRouter.get('/create-booking-for-stripe', bookingHandler.createBookingForStripe);

bookingsRouter.use(authHandler.protect);

// create session
bookingsRouter.post(
  '/tour/:id/create-session',
  tourHandler.getTour,
  bookingHandler.createSession
);

// get all the bookings using user and tour
bookingsRouter.get('/my-booked-tours', bookingHandler.getMyBookedTours);

// create booking
// bookingsRouter.post(
//     '/tour/:id/booking',
//     tourHandler.getTour,
//     bookingHandler.createBookingByTourAndUser
// );

module.exports = bookingsRouter;
