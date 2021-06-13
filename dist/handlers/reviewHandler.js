"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setTourAndUser = exports.deleteReview = exports.updateReview = exports.createReview = exports.checkBody = exports.getReviewById = exports.getAllReviews = void 0;
const ReviewModel = require('../models/reviewModel');
const TourModel = require('../models/tourModel');
const factoryFunctions = require('./factoryFunctions');
const catchAsync = require('../utils/catchAsync');
exports.getAllReviews = factoryFunctions.getAll(ReviewModel);
exports.getReviewById = factoryFunctions.getOne(ReviewModel);
exports.checkBody = factoryFunctions.checkBody();
exports.createReview = factoryFunctions.createOne(ReviewModel);
exports.updateReview = factoryFunctions.updateOne(ReviewModel);
exports.deleteReview = factoryFunctions.deleteOne(ReviewModel);
exports.setTourAndUser = catchAsync(async (req, res, next) => {
    req.body.tour = req.body.tour.id || req.params.tourId;
    req.body.user = req.body.user.id;
    next();
});
