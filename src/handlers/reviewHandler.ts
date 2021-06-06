import { NextFunction, Request, Response } from 'express';

const ReviewModel = require('../models/reviewModel');
const TourModel = require('../models/tourModel');
const factoryFunctions = require('./factoryFunctions');
const catchAsync = require('../utils/catchAsync');

export const getAllReviews = factoryFunctions.getAll(ReviewModel);

export const getReviewById = factoryFunctions.getOne(ReviewModel);

export const checkBody = factoryFunctions.checkBody();
export const createReview = factoryFunctions.createOne(ReviewModel);
export const updateReview = factoryFunctions.updateOne(ReviewModel);
export const deleteReview = factoryFunctions.deleteOne(ReviewModel);

export const setTourAndUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    req.body.tour = req.body.tour || req.params.tourId;
    if (!(await TourModel.findById(req.body.tour)))
      return next(new Error('No tour found with this ID!'));
    req.body.user = req.body.user || req.body.user.id;
    next();
  }
);
