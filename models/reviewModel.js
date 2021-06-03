const { Schema, model } = require('mongoose');
const TourModel = require('./tourModel');

const reviewSchema = new Schema(
  {
    review: {
      type: String,
      required: [true, 'Please provide your review']
    },
    rating: {
      type: Number,
      min: [1, 'You cannot provide rating below 1'],
      max: [5, 'You cannot provide rating above 5'],
      required: [true, 'Please give a rating!']
    },
    user: {
      type: Schema.ObjectId,
      ref: 'users',
      required: [true, 'Please provide a user']
    },
    tour: {
      type: Schema.ObjectId,
      ref: 'tours',
      required: [true, 'Please provide a tour']
    }
  },
  {
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
  }
);

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

// 1) get the tour based on the review's tour.
// 2) update the tour's averageRating and ratingsQuantity can be updated by using aggregation pipeline
reviewSchema.post('save', async function (doc) {
  await this.constructor.setRatings(doc.tour);
});

reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.findOne();
  next();
});
reviewSchema.post(/^findOneAnd/, async function () {
  await this.r.constructor.setRatings(this.r.tour);
});

reviewSchema.statics.setRatings = async function (tourID) {
  const pipeline = await this.aggregate([
    {
      $match: {
        tour: tourID
      }
    },
    {
      $group: {
        _id: null,
        ratingsAverage: { $avg: '$rating' },
        ratingsQuantity: { $sum: 1 }
      }
    }
  ]);

  const { ratingsAverage, ratingsQuantity } = pipeline[0];
  await TourModel.findByIdAndUpdate(
    tourID,
    {
      ratingsAverage,
      ratingsQuantity
    },
    {
      runValidators: true,
      new: true
    }
  );
};

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: '-__v -isDeleted -passwordResetToken -passwordResetTokenTimeOut'
  });
  next();
});

const reviewModel = model('reviews', reviewSchema);

module.exports = reviewModel;
