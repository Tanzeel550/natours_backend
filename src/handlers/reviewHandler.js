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
  req.body.tour = req.body.tour || req.params.tourId;
  if (!(await TourModel.findById(req.body.tour)))
    return next(new Error('No tour found with this ID!'));
  req.body.user = req.body.user || req.user.id;
  next();
});
