import catchAsync from '../utils/catchAsync';
import APIFeatures from '../utils/APIFeatures';
import AppError from '../utils/AppError';
import { Document, DocumentQuery, Model } from 'mongoose';
import { NextFunction, Request, Response } from 'express';

export const getAll = <T extends Document>(model: Model<T>) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    console.log('Request received');
    let query = new APIFeatures<T>(model.find(), req.query)
      .filter()
      .limitFields()
      .paginationAndLimitation()
      .sort().query;

    let doc = await query;
    res.status(200).json({
      status: 'Success',
      length: doc.length,
      data: {
        data: doc
      }
    });
  });
};

export const getOne = <T extends Document>(model: Model<T>) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    let query: DocumentQuery<Document | null, Document> = model.findById(
      req.params.id
    );

    // req.body.toBePopulatedWith is an array of strings
    // if (req.body.toBePopulatedWith) {
    //   req.body.toBePopulatedWith.forEach((item: string) =>
    //     query.populate(item)
    //   );
    // }

    const doc = await query;
    if (!doc) {
      return next(new AppError('No such document found with this ID', 404));
    }

    res.status(200).json({
      status: 'Success',
      data: {
        data: doc
      }
    });
  });
};

// export const populateWith = (...args: [string]) => {
//   return (req: Request, res: Response, next: NextFunction) => {
//     req.body.toBePopulatedWith = args;
//     next();
//   };
// };

export const createOne = <T extends Document>(model: Model<T>) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const doc = await model.create(req.body);
    res.status(200).json({
      status: 'Success',
      data: {
        data: doc
      }
    });
  });
};

export const updateOne = <T extends Document>(model: Model<T>) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const doc = await model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!doc)
      return next(new AppError('No such document found with this ID', 404));
    res.status(200).json({
      status: 'Success',
      data: { doc }
    });
  });
};

export const deleteOne = <T extends Document>(model: Model<T>) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    await model.findByIdAndRemove(req.params.id);
    res.status(204).json({});
  });
};

export const checkBody = () => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    if (Object.keys(req.body).length === 0)
      return next(new AppError('Body is No provided', 404));
    next();
  });
};
