const express = require('express');
const reviewHandler = require('./../handlers/reviewHandler');
const authHandler = require('./../handlers/authHandler');
const tourHandler = require('./../handlers/tourHandler');

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

module.exports = reviewRouter;
