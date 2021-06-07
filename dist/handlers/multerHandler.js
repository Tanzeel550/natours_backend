"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadTourPhotos = exports.tourMultipleUploads = exports.resizeUserPhoto = exports.userSingleUpload = void 0;
const multer_1 = __importDefault(require("multer"));
const catchAsync_1 = __importDefault(require("../utils/catchAsync"));
const sharp_1 = __importDefault(require("sharp"));
const slugify_1 = __importDefault(require("slugify"));
const AppError_1 = __importDefault(require("../utils/AppError"));
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        return cb(null, true);
    }
    else {
        return cb(new AppError_1.default('This file cannot be uploaded', 404));
    }
};
const storage = multer_1.default.memoryStorage();
const upload = multer_1.default({ storage: storage, fileFilter });
exports.userSingleUpload = upload.single('photo');
exports.resizeUserPhoto = catchAsync_1.default(async (req, res, next) => {
    if (!req.file)
        return next();
    const nameOfPhoto = `user-${req.body.user.id}-${Date.now()}.jpg`;
    await sharp_1.default(req.file.buffer)
        .resize(128, 128)
        .jpeg()
        .toFile(`public/img/users/${nameOfPhoto}`);
    req.body.photo = nameOfPhoto;
    next();
});
exports.tourMultipleUploads = upload.fields([
    { name: 'imageCover', maxCount: 1 },
    { name: 'images', maxCount: 3 }
]);
exports.uploadTourPhotos = catchAsync_1.default(async (req, res, next) => {
    if (!req.files)
        return next();
    const files = req.files;
    const { imageCover, images } = files;
    if (!imageCover || !images)
        return next();
    const tour = req.body.tour;
    await sharp_1.default(imageCover[0].buffer)
        .resize(2000, 1333)
        .jpeg()
        .toFile(`public/img/tours/tour-${tour.slug}-cover.jpeg`);
    req.body.imageCover = `tour-${slugify_1.default(tour.slug)}-cover.jpeg`;
    req.body.images = [];
    const promisifiedImages = images.map(async (image, i) => {
        const name = `public/img/tours/tour-${tour.slug}-${i + 1}.jpeg`;
        await sharp_1.default(image.buffer).resize(2000, 1333).jpeg().toFile(name);
        req.body.images.push(`tour-${slugify_1.default(tour.slug)}-${i + 1}.jpeg`);
    });
    await Promise.all(promisifiedImages);
    next();
});
