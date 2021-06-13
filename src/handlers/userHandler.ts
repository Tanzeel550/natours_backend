import catchAsync from '../utils/catchAsync';
import AppError from '../utils/AppError';
import UserModel from '../models/userModel';
import * as factoryFunctions from './factoryFunctions';
import { NextFunction, Request, RequestHandler, Response } from 'express';
import { IGetUserAuthInfoRequest } from '../types/authTypes';
import TourModel from '../models/tourModel';

export const updateMe = catchAsync(
  async (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => {
    let { body } = req;
    if (body.password || body.confirmPassword)
      return next(new AppError('This route is not for updating password', 404));
    console.log(req.user);
    const updatedUser = await UserModel.findByIdAndUpdate(
      req.user!.id,
      req.body,
      {
        runValidators: true,
        new: true
      }
    ).select('-password -createdAt -changedPasswordAt');

    res.status(200).json({
      status: 'Success',
      data: updatedUser
    });
  }
);

export const deleteMe = catchAsync(
  async (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => {
    await TourModel.findByIdAndUpdate(
      req.user!.id,
      { isDeleted: true },
      { runValidators: true }
    );
    res.status(204).json({
      status: 'Success'
    });
  }
);

export const getMe = (req: IGetUserAuthInfoRequest, res: Response) => {
  res.status(200).json({
    status: 'Success',
    user: req.user
  });
};

export const getAllUsers = factoryFunctions.getAll(UserModel);
export const getUserById = factoryFunctions.getOne(UserModel);
export const deleteUser = factoryFunctions.deleteOne(UserModel);
export const updateUser = factoryFunctions.updateOne(UserModel);
export const checkBody = factoryFunctions.checkBody();
