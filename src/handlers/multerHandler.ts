import multer from 'multer';
import catchAsync from '../utils/catchAsync';
import sharp from 'sharp';
import slugify from 'slugify';
import AppError from '../utils/AppError';
import { NextFunction, Request, Response } from 'express';
import UserDocumentType from '../types/authTypes';

// const storage = multer.diskStorage({
//     destination: function (req: Request, file, cb) {
//         cb(null, 'public/img/users/myUploads/')
//     },
//     filename: function (req: Request, file, cb) {
//         cb(null, file.fieldname + '-' + Date.now()+".jpeg")
//     }
// })

const fileFilter = (req: Request, file: Express.Multer.File, cb: Function) => {
  if (file.mimetype.startsWith('image')) {
    return cb(null, true);
  } else {
    return cb(new AppError('This file cannot be uploaded', 404));
  }
};

const storage: multer.StorageEngine = multer.memoryStorage();
const upload = multer({ storage: storage, fileFilter });

// <-------------------Process for uploading single user photo ------------------->
export const userSingleUpload = upload.single('photo');
export const resizeUserPhoto = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.file) return next();

    const nameOfPhoto = `user-${
      (req.body.user as UserDocumentType).id
    }-${Date.now()}.jpg`;

    await sharp(req.file.buffer)
      .resize(128, 128)
      .jpeg()
      .toFile(`public/img/users/${nameOfPhoto}`);

    req.body.photo = nameOfPhoto;
    next();
  }
);

// <-------------------Process for uploading multiple tours photo ------------------->
export const tourMultipleUploads = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 }
]);

export const uploadTourPhotos = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.files) return next();

    type filesType = {
      imageCover: [Express.Multer.File];
      images: [Express.Multer.File];
    };

    // @ts-ignore
    const files: filesType = req.files;
    const { imageCover, images } = files;
    if (!imageCover || !images) return next();

    const tour = req.body.tour;

    await sharp(imageCover[0].buffer)
      .resize(2000, 1333)
      .jpeg()
      .toFile(`public/img/tours/tour-${tour.slug}-cover.jpeg`);
    req.body.imageCover = `tour-${slugify(tour.slug)}-cover.jpeg`;

    req.body.images = [];
    const promisifiedImages = images.map(async (image, i) => {
      const name = `public/img/tours/tour-${tour.slug}-${i + 1}.jpeg`;
      await sharp(image.buffer).resize(2000, 1333).jpeg().toFile(name);
      req.body.images.push(`tour-${slugify(tour.slug)}-${i + 1}.jpeg`);
    });

    await Promise.all(promisifiedImages);
    next();
  }
);
