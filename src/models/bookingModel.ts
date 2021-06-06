import { HookNextFunction, model, Schema } from 'mongoose';
import BookingDocumentType from '../types/bookingTypes';

const bookingSchema = new Schema({
  tour: {
    type: Schema.Types.ObjectId,
    ref: 'tours',
    required: [true, 'A booking must belong a tour']
  },
  user: {
    type: Schema.Types.ObjectId,
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

bookingSchema.pre(
  // @ts-ignore
  /^find/,
  function (this: BookingDocumentType, next: HookNextFunction) {
    this.populate('tour').populate({
      path: 'user',
      select: 'name email role'
    });
    next();
  }
);

bookingSchema.pre(
  'find',
  function (this: BookingDocumentType, next: HookNextFunction) {
    this.price = this.price / 100; // converting cents to dollars
    next();
  }
);

const BookingModel = model<BookingDocumentType>('bookings', bookingSchema);

export = BookingModel;
