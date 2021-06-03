const { Schema, model } = require('mongoose');

const bookingSchema = new Schema({
  tour: {
    type: Schema.ObjectId,
    ref: 'tours',
    required: [true, 'A booking must belong a tour']
  },
  user: {
    type: Schema.ObjectId,
    ref: 'users',
    required: [true, 'A booking must belong a user']
  },
  createdAt: {
    type: Date,
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

const BookingModel = model('bookings', bookingSchema);

module.exports = BookingModel;
