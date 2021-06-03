const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const UserModel = require('../models/userModel');
const factoryFunctions = require('./factoryFunctions');

exports.updateMe = catchAsync(async (req, res, next) => {
  let { user, body } = req;
  if (body.password || body.confirmPassword)
    return next(new AppError('This route is not for updating password', 404));

  const updatedUser = await UserModel.findByIdAndUpdate(user.id, req.body, {
    runValidators: true,
    new: true
  }).select('-password -createdAt -changePasswordAt');

  res.status(200).json({
    status: 'Success',
    data: updatedUser
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  let user = req.user;
  await user.updateOne({ isDeleted: true }, { runValidators: true });
  res.status(204).json({
    status: 'Success'
  });
});

exports.getMe = (req, res) => {
  res.status(200).json({
    status: 'Success',
    user: req.user
  });
};

exports.getAllUsers = factoryFunctions.getAll(UserModel);
exports.getUserById = factoryFunctions.getOne(UserModel);
exports.deleteUser = factoryFunctions.deleteOne(UserModel);
exports.updateUser = factoryFunctions.updateOne(UserModel);
exports.checkBody = factoryFunctions.checkBody();
