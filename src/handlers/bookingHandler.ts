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

export const webHookCheckout: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const signature: string | string[] | undefined =
      req.headers['stripe-signature'];

    const event = stripe.webhooks.constructEvent(
      req.body,
      signature!!,
      process.env.STRIPE_WEBHOOK_SECRET!!
    );
    if (event.type === 'checkout.session.completed') {
      const session: any = event.data.object;

      const tour = session.client_reference_id;
      const user: UserDocumentType | null = await UserModel.findOne({
        email: session.customer_email
      });
      if (!user) {
        throw new AppError('No user found with this id', 404);
      }
      let price = session.amount_total / 100;
      await BookingModel.create({ tour, user: user.id, price });
      res.status(200).json({
        status: 'Success'
      });
    }
  } catch (e) {
    res.status(400).json({
      message: `WebHook Error: ${e.message}`,
      stack: e.stack,
      error: JSON.stringify(e),
      headers: JSON.stringify(req.headers)
    });
  }
};

export const getAllBookings = factoryFunctions.getAll(BookingModel);
export const getBookingById = factoryFunctions.getOne(BookingModel);
export const createBooking = factoryFunctions.createOne(BookingModel);
export const updateBooking = factoryFunctions.updateOne(BookingModel);
export const deleteBooking = factoryFunctions.deleteOne(BookingModel);
