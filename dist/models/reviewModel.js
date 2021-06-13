"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const mongoose_1 = require("mongoose");
const tourModel_1 = __importDefault(require("./tourModel"));
const reviewSchema = new mongoose_1.Schema({
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
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'users',
        required: [true, 'Please provide a user']
    },
    tour: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'tours',
        required: [true, 'Please provide a tour']
    }
}, {
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });
reviewSchema.post('save', async function (error, doc) {
    await this.constructor.setRatings(doc.tour);
});
reviewSchema.pre(/^findOneAnd/, async function (next) {
    const l = await this.findOne();
    this.r = l;
    console.log('Review was created');
    next();
});
reviewSchema.post(/^findOneAnd/, async function () {
    await this.r.constructor.setRatings(this.r.tour.id);
    console.log(this.r.tour);
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
    console.log(pipeline);
    const { ratingsAverage, ratingsQuantity } = pipeline[0];
    await tourModel_1.default.findByIdAndUpdate(tourID, {
        ratingsAverage,
        ratingsQuantity
    }, {
        runValidators: true,
        new: true
    });
};
reviewSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'user',
        select: '-__v -passwordResetToken -passwordResetTokenTimeOut -changedPasswordAt -isVerified'
    });
    next();
});
const ReviewModel = mongoose_1.model('reviews', reviewSchema);
module.exports = ReviewModel;
