import express from 'express';
import * as tourHandler from '../handlers/tourHandler';
import * as authHandler from '../handlers/authHandler';
import reviewRouter from './reviewRouter';
import * as multerHandler from '../handlers/multerHandler';

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
    tourHandler.getTourById,
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

export default tourRouter;
