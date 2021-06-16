import catchAsync from '../utils/catchAsync';
import BookingModel from '../models/bookingModel';
import { NextFunction, Request, RequestHandler, Response } from 'express';
import Stripe from 'stripe';
import UserDocumentType, { IGetUserAuthInfoRequest } from '../types/authTypes';
import * as factoryFunctions from './factoryFunctions';
import AppError from '../utils/AppError';
import UserModel from '../models/userModel';
import { IGetTourInfoRequest } from '../types/tourTypes';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

type ICheckoutSession = Stripe.checkouts.sessions.ICheckoutSession;

export const createSession: RequestHandler = catchAsync(
  async (
    req: IGetUserAuthInfoRequest & IGetTourInfoRequest,
    res: Response,
    next: NextFunction
  ) => {
    const { user, tour } = req;
    const { frontend_url } = req.body;

    const session: ICheckoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: user!.email,
      client_reference_id: tour!.id,
      success_url: `${frontend_url}/my-bookings`,
      cancel_url: `${frontend_url}/tour/${req.tour?.id}`,
      line_items: [
        {
          amount: tour!.price * 100,
          quantity: 1,
          currency: 'usd',
          images: [
            `${req.protocol}://${req.get('host')}/img/tours/${tour!.imageCover}`
          ],
          name: `${tour!.name} Tour`,
          description: tour!.summary
        }
      ]
    });

    res.status(200).json({
      status: 'Success',
      session
    });
  }
);

export const createBookingForStripe: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { tour, user, price } = req.query.params as {
      tour: string;
      user: string;
      price: string;
    };
    const booking = await BookingModel.create({ tour, user, price });
    res.status(200).json({
      status: 'Success',
      data: booking
    });
  }
);

export const getMyBookedTours = catchAsync(
  async (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => {
    //    1) Get all bookings by user id
    const allBookings = await BookingModel.find({
      user: (req.user as UserDocumentType).id
    });

    //    2) Get all the tours from bookings
    const myTours = allBookings.map(booking => booking.tour);

    res.status(200).json({
      status: 'Success',
      data: myTours
    });
  }
);

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

const createBookingCheckout = async (sessionData: ICheckoutSession) => {
  console.log(sessionData);
  // TODO: Make the following code work
  //  we need to figure out the type of the session data and write the following code accordingly
  const tour = sessionData.client_reference_id;
  const user: UserDocumentType | null = await UserModel.findOne({
    email: sessionData.customer_email
  });
  if (!user) {
    throw new AppError('No user found with this id', 404);
  }
  let price = sessionData.display_items[0].amount;
  await BookingModel.create({ tour, user: user.id, price });
};

export const webHookCheckout: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log(req.headers);
  const signature: string | string[] | undefined =
    req.headers['stripe-signature'];
  console.log(signature);
  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      signature!!,
      process.env.Stripe_WEBHOOK_SECRET!!
    );
    console.log();
    if (event.type === 'checkout.session.completed') {
      console.log(event.data)
      // TODO: need to implement
      //  first check the event and then implement
      // @ts-ignore
      await createBookingCheckout(event.data.object);
      res.status(200).json({
        status: 'Success'
      });
    }
  } catch (e) {
    console.log(e.message);
    return res.status(400).json({
      message: `WebHook Error: ${e.message}`,
      stack: e.stack,
      error: JSON.stringify(e)
    });
  }

  res.status(200).json({ received: true });
};

export const getAllBookings = factoryFunctions.getAll(BookingModel);
export const getBookingById = factoryFunctions.getOne(BookingModel);
export const createBooking = factoryFunctions.createOne(BookingModel);
export const updateBooking = factoryFunctions.updateOne(BookingModel);
export const deleteBooking = factoryFunctions.deleteOne(BookingModel);
