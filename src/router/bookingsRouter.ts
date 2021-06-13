import express from 'express';
import * as authHandler from '../handlers/authHandler';
import * as tourHandler from '../handlers/tourHandler';
import * as bookingHandler from '../handlers/bookingHandler';

const bookingsRouter = express.Router({
  mergeParams: true
});

// The following fake route actually goes like this
// create-booking-for-stripe?tour=TOUR_ID&user=USER_ID&price=PRICE
bookingsRouter.get(
  '/create-booking-for-stripe',
  bookingHandler.createBookingForStripe
);

bookingsRouter.use(authHandler.protect);

// create session
bookingsRouter.post(
  '/tour/:id/create-session',
  tourHandler.setTourAtRequest,
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

export = bookingsRouter;
