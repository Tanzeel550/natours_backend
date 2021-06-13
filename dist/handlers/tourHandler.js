"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getToursWithIn = exports.getTourStats = exports.setTourAtRequest = exports.deleteTour = exports.updateTour = exports.createTour = exports.getTourById = exports.getAllTours = exports.checkBody = void 0;
const TourModel = require('../models/tourModel');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const factoryFunctions = require('./factoryFunctions');
exports.checkBody = factoryFunctions.checkBody();
exports.getAllTours = factoryFunctions.getAll(TourModel);
exports.getTourById = factoryFunctions.getOne(TourModel);
exports.createTour = factoryFunctions.createOne(TourModel);
exports.updateTour = factoryFunctions.updateOne(TourModel);
exports.deleteTour = factoryFunctions.deleteOne(TourModel);
exports.setTourAtRequest = catchAsync(async (req, res, next) => {
    const tour = await TourModel.findById(req.params.id);
    if (!tour)
        return next(new AppError('No such tour found', 404));
    req.tour = tour;
    next();
});
exports.getTourStats = catchAsync(async (req, res, next) => {
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
});
exports.getToursWithIn = catchAsync(async (req, res, next) => {
    const radiusOfEarthInMiles = 3958.8;
    const radiusOfEarthInKM = 6371;
    const { lat, lng, distance, unit } = req.params;
    if (!lat || !lng || !unit || !distance) {
        return next(new AppError('Please provide the three arguments-> lat, lng, distance and unit', 404));
    }
    res.status(200).json({
        status: 'Success'
    });
});
