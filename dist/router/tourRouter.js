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
const tourHandler = __importStar(require("../handlers/tourHandler"));
const authHandler = __importStar(require("../handlers/authHandler"));
const reviewRouter_1 = __importDefault(require("./reviewRouter"));
const multerHandler = __importStar(require("../handlers/multerHandler"));
const tourRouter = express_1.default.Router();
tourRouter.route('/getTourStats').get(tourHandler.getTourStats);
tourRouter
    .route('/toursWithIn/lng/:lng/lat/:lat/distance/:distance/unit/:unit')
    .get(tourHandler.getToursWithIn);
tourRouter
    .route('/')
    .get(tourHandler.getAllTours)
    .post(authHandler.protect, authHandler.restrictTo('admin'), tourHandler.checkBody, tourHandler.createTour);
tourRouter
    .route('/:id')
    .get(tourHandler.getTourById)
    .all(authHandler.protect, authHandler.restrictTo('admin'))
    .put(tourHandler.getTourById, multerHandler.tourMultipleUploads, multerHandler.uploadTourPhotos, tourHandler.updateTour)
    .delete(multerHandler.tourMultipleUploads, multerHandler.uploadTourPhotos, tourHandler.deleteTour);
tourRouter.use('/:tourId/reviews', reviewRouter_1.default);
module.exports = tourRouter;
