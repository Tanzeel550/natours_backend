const chalk = require('chalk');
const multer = require('multer');
const catchAsync = require('./../utils/catchAsync');
const sharp = require('sharp');
const slugify = require('slugify');
const AppError = require('./../utils/AppError');
const fs = require('fs');

// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, 'public/img/users/myUploads/')
//     },
//     filename: function (req, file, cb) {
//         cb(null, file.fieldname + '-' + Date.now()+".jpeg")
//     }
// })

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        return cb(null, true);
    } else {
        return cb(new AppError('This file cannot be uploaded', 404));
    }
};

const storage = multer.memoryStorage();
const upload = multer({ storage: storage, fileFilter });

// <-------------------Process for uploading single user photo ------------------->
exports.userSingleUpload = upload.single('photo');
exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
    if (!req.file) return next();

    const nameOfPhoto = `user-${req.user.id}-${Date.now()}.jpg`;

    await sharp(req.file.buffer).resize(128, 128).jpeg().toFile(`public/img/users/${nameOfPhoto}`);

    req.body.photo = nameOfPhoto;
    next();
});

// <-------------------Process for uploading multiple tours photo ------------------->
exports.tourMultipleUploads = upload.fields([
    { name: 'imageCover', maxCount: 1 },
    { name: 'images', maxCount: 3 }
]);

exports.uploadTourPhotos = catchAsync(async (req, res, next) => {
    if (!req.files) return next();

    const { imageCover, images } = req.files;
    if (!imageCover || !images) return next();

    await sharp(imageCover[0].buffer)
        .resize(2000, 1333)
        .jpeg()
        .toFile(`public/img/tours/tour-${req.tour.slug}-cover.jpeg`);
    req.body.imageCover = `tour-${slugify(req.tour.slug)}-cover.jpeg`;

    req.body.images = [];
    const promisifiedImages = images.map(async (image, i) => {
        const name = `public/img/tours/tour-${req.tour.slug}-${i + 1}.jpeg`;
        await sharp(image.buffer).resize(2000, 1333).jpeg().toFile(name);
        req.body.images.push(`tour-${slugify(req.tour.slug)}-${i + 1}.jpeg`);
    });

    await Promise.all(promisifiedImages);
    next();
});
