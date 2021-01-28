const TourModel = require('../models/tourModel');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const factoryFunctions = require('./factoryFunctions');

// exports.populateTour = factoryFunctions.populateWith(["guides", "reviews"])

exports.checkBody = factoryFunctions.checkBody();
exports.getAllTours = factoryFunctions.getAll(TourModel);
exports.getTourById = factoryFunctions.getOne(TourModel);
exports.createTour = factoryFunctions.createOne(TourModel);
exports.updateTour = factoryFunctions.updateOne(TourModel);
exports.deleteTour = factoryFunctions.deleteOne(TourModel);

// TODO: Implement Tour Stats function
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

// TODO: implement the following
exports.getToursWithIn = catchAsync(async (req, res, next) => {
    const radiusOfEarthInMiles = 3958.8;
    const radiusOfEarthInKM = 6371;

    const { lat, lng, distance, unit } = req.params;

    if (!lat || !lng || !unit || !distance) {
        return next(
            new AppError('Please provide the three arguments-> lat, lng, distance and unit', 404)
        );
    }

    res.status(200).json({
        status: 'Success'
    });
});

exports.getTour = catchAsync(async (req, res, next) => {
    req.tour = await TourModel.findById(req.params.id);
    next();
});
