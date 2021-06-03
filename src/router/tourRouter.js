const express = require('express');
const tourHandler = require('../handlers/tourHandler');
const authHandler = require('../handlers/authHandler');
const reviewRouter = require('./reviewRouter');
const multerHandler = require('../handlers/multerHandler');
const stripeHandler = require('../handlers/bookingHandler');

const tourRouter = express.Router();

tourRouter.route('/getTourStats').get(tourHandler.getTourStats);

tourRouter
  .route('/toursWithIn/lng/:lng/lat/:lat/distance/:distance/unit/:unit')
  .get(tourHandler.getToursWithIn);

tourRouter
  .route('/')
  .get(tourHandler.getAllTours)
  .post(
    authHandler.protect,
    authHandler.restrictTo('admin'),
    tourHandler.checkBody,
    tourHandler.createTour
  );

tourRouter
  .route('/:id')
  .get(
    // tourHandler.populateTour,
    tourHandler.getTourById
  )
  .all(authHandler.protect, authHandler.restrictTo('admin'))
  .put(
    tourHandler.getTour,
    multerHandler.tourMultipleUploads,
    multerHandler.uploadTourPhotos,
    tourHandler.updateTour
  )
  .delete(
    multerHandler.tourMultipleUploads,
    multerHandler.uploadTourPhotos,
    tourHandler.deleteTour
  );

tourRouter.use('/:tourId/reviews', reviewRouter);

module.exports = tourRouter;
