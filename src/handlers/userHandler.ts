import catchAsync from '../utils/catchAsync';
import AppError from '../utils/AppError';
import UserModel from '../models/userModel';
import * as factoryFunctions from './factoryFunctions';
import { NextFunction, Request, RequestHandler, Response } from 'express';

export const updateMe = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    let { body } = req;
    if (body.password || body.confirmPassword)
      return next(new AppError('This route is not for updating password', 404));

    const updatedUser = await UserModel.findByIdAndUpdate(
      req.body.user.id,
      req.body,
      {
        runValidators: true,
        new: true
      }
    ).select('-password -createdAt -changePasswordAt');

    res.status(200).json({
      status: 'Success',
      data: updatedUser
    });
  }
);

export const deleteMe = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    let user = req.body.user;
    await user.updateOne({ isDeleted: true }, { runValidators: true });
    res.status(204).json({
      status: 'Success'
    });
  }
);

export const getMe: RequestHandler = (req, res) => {
  res.status(200).json({
    status: 'Success',
    user: req.body.user
  });
};

export const getAllUsers = factoryFunctions.getAll(UserModel);
export const getUserById = factoryFunctions.getOne(UserModel);
export const deleteUser = factoryFunctions.deleteOne(UserModel);
export const updateUser = factoryFunctions.updateOne(UserModel);
export const checkBody = factoryFunctions.checkBody();
