"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const reviewHandler = __importStar(require("../handlers/reviewHandler"));
const authHandler = __importStar(require("../handlers/authHandler"));
const reviewRouter = express_1.default.Router({
    mergeParams: true
});
reviewRouter
    .route('/')
    .get(reviewHandler.getAllReviews)
    .post(authHandler.protect, authHandler.restrictTo('user'), reviewHandler.checkBody, reviewHandler.setTourAndUser, reviewHandler.createReview);
reviewRouter
    .route('/:id')
    .get(reviewHandler.getReviewById)
    .put(authHandler.protect, authHandler.restrictTo('user'), reviewHandler.checkBody, reviewHandler.setTourAndUser, reviewHandler.updateReview)
    .delete(authHandler.protect, authHandler.restrictTo('user'), reviewHandler.setTourAndUser, reviewHandler.deleteReview);
module.exports = reviewRouter;
