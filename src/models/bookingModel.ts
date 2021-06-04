import { HookNextFunction, MongooseDocument } from 'mongoose';
import { BookingDocumentType } from '../types/bookingTypes';
import { Schema, model } from 'mongoose';

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

bookingSchema.pre(/^find/, function (next: HookNextFunction) {
  // @ts-ignore
  const doc: MongooseDocument & BookingDocumentType = this;
  doc.populate('tour').populate({
    path: 'user',
    select: 'name email role'
  });
  next();
});

const BookingModel = model<BookingDocumentType>('bookings', bookingSchema);

export default BookingModel;
