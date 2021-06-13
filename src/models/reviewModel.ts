import { HookNextFunction, Model, model, Query, Schema } from 'mongoose';
import ReviewDocumentType from '../types/reviewTypes';
import { MongoError } from 'mongodb';
import TourModel from './tourModel';

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
      type: Schema.Types.ObjectId,
      ref: 'users',
      required: [true, 'Please provide a user']
    },
    tour: {
      type: Schema.Types.ObjectId,
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
reviewSchema.post(
  'save',
  async function (
    this: Query<ReviewDocumentType>,
    error: MongoError,
    doc: ReviewDocumentType
  ) {
    // @ts-ignore
    await this.constructor.setRatings(doc.tour);
  }
);

reviewSchema.pre(
  // @ts-ignore
  /^findOneAnd/,
  async function (this: Model<ReviewDocumentType>, next: HookNextFunction) {
    const l = await this.findOne();
    // @ts-ignore
    this.r = l!!;
    console.log('Review was created');
    next();
  }
);
// @ts-ignore
reviewSchema.post(/^findOneAnd/, async function (this: ReviewDocumentType) {
  // @ts-ignore
  await this.r.constructor.setRatings(this.r.tour.id);
  console.log(this.r.tour);
});

reviewSchema.statics.setRatings = async function (tourID: string) {
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
  console.log(pipeline);
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

reviewSchema.pre(
  // @ts-ignore
  /^find/,
  function (this: ReviewDocumentType, next: HookNextFunction) {
    this.populate({
      path: 'user',
      select:
        '-__v -passwordResetToken -passwordResetTokenTimeOut -changedPasswordAt -isVerified'
    });
    next();
  }
);

const ReviewModel = model<ReviewDocumentType>('reviews', reviewSchema);

export = ReviewModel;
