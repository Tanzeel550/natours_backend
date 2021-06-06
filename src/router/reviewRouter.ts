import express from 'express';
import * as reviewHandler from '../handlers/reviewHandler';
import * as authHandler from '../handlers/authHandler';

const reviewRouter = express.Router({
  mergeParams: true
});

reviewRouter
  .route('/')
  .get(reviewHandler.getAllReviews)
  //    <----------------- Review must be edited and deleted by the user ---------------->
  .post(
    authHandler.protect,
    authHandler.restrictTo('user'),
    reviewHandler.checkBody,
    reviewHandler.setTourAndUser,
    reviewHandler.createReview
  );

reviewRouter
  .route('/:id')
  .get(reviewHandler.getReviewById)
  //    <----------------- Review must be edited and deleted by the user ---------------->
  .put(
    authHandler.protect,
    authHandler.restrictTo('user'),
    reviewHandler.checkBody,
    reviewHandler.setTourAndUser,
    reviewHandler.updateReview
  )
  .delete(
    authHandler.protect,
    authHandler.restrictTo('user'),
    reviewHandler.setTourAndUser,
    reviewHandler.deleteReview
  );

export = reviewRouter;
