import { NextFunction, Request, RequestHandler, Response } from 'express';
import { IGetTourInfoRequest } from '../types/tourTypes';

const TourModel = require('../models/tourModel');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const factoryFunctions = require('./factoryFunctions');

// exports.populateTour = factoryFunctions.populateWith(["guides", "reviews"])

export const checkBody = factoryFunctions.checkBody();
export const getAllTours = factoryFunctions.getAll(TourModel);
export const getTourById = factoryFunctions.getOne(TourModel);
export const createTour = factoryFunctions.createOne(TourModel);
export const updateTour = factoryFunctions.updateOne(TourModel);
export const deleteTour = factoryFunctions.deleteOne(TourModel);

export const setTourAtRequest: RequestHandler = catchAsync(
  async (req: IGetTourInfoRequest, res: Response, next: NextFunction) => {
    const tour = await TourModel.findById(req.params.id);
    if (!tour) return next(new AppError('No such tour found', 404));
    req.tour = tour;
    next();
  }
);

// TODO: Implement Tour Stats function
export const getTourStats = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const stats = await TourModel.aggregate([
      {
        $group: {
          _id: '$ratingsAverage'
        }
      }
    ]);
    res.status(200).json({
      status: 'Success',
      data: {
        stats
      }
    });
  }
);

// TODO: implement the following
export const getToursWithIn = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const radiusOfEarthInMiles = 3958.8;
    const radiusOfEarthInKM = 6371;

    const { lat, lng, distance, unit } = req.params;

    if (!lat || !lng || !unit || !distance) {
      return next(
        new AppError(
          'Please provide the three arguments-> lat, lng, distance and unit',
          404
        )
      );
    }

    res.status(200).json({
      status: 'Success'
    });
  }
);
