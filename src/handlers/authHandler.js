const crypto = require('crypto');
const UserModel = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const jsonWebToken = require('jsonwebtoken');
const AppError = require('../utils/AppError');
const sendEmail = require('../utils/sendEmail');
const { promisify } = require('util');

const generateToken = (user, res) => {
  const token = jsonWebToken.sign({ id: user.id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRY
  });
  user.password = undefined;
  return res
    .status(200)
    .cookie('token', token, {
      httpOnly: true,
      expires: new Date(
        Date.now() + process.env.JWT_EXPIRY_INT * 24 * 60 * 60 * 1000
      )
    })
    .json({
      status: 'Success',
      token,
      user
    });
};

exports.protect = catchAsync(async (req, res, next) => {
  //    1) Grab the authorization from request headers
  let token;
  if (req.cookies.token) token = req.cookies.token;
  else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  )
    token = req.headers.authorization.split(' ')[1];
  else token = undefined;

  // 2) if token is invalid than send back an error
  if (!token)
    return next(
      new AppError('Your token is invalid. Please login again!', 404)
    );

  //    3) Get the token and id from that token
  const verifyToken = await promisify(jsonWebToken.verify)(
    token,
    process.env.JWT_SECRET_KEY
  );
  const { id, iat } = verifyToken;

  //    4) Get the user based on the id, if no user send back an error
  const user = await UserModel.findById(id).select(
    '+password +changePasswordAt'
  );

  if (!user) return next(new AppError('Your Email does not exist', 404));
  if (!user.isVerified)
    return next(new AppError('Your Email is not verified', 404));

  // 5) Check if the user has not changed password
  const isAfter = user.isAfter(iat);
  if (isAfter)
    return next(
      new AppError('Please Login again. Your password is changed', 404)
    );

  req.user = user;
  next();
});

// This is only for verifying user from frontend if the token stored in frontend is right!
exports.verifyToken = catchAsync(async (req, res, next) =>
  generateToken(req.user, res)
);

exports.restrictTo = (...args) => {
  return (req, res, next) => {
    const isAuth = args.includes(req.user.role);
    if (isAuth) {
      // The req.user contains the role
      return next();
    } else {
      return next(new AppError('You are not authorized to get access', 404));
    }
  };
};

exports.sendSignUpEmail = catchAsync(async (req, res, next) => {
  const { name, email, password, confirmPassword, linkToRedirect } = req.body;

  let user;

  try {
    user = await UserModel.create({ name, email, password, confirmPassword });
  } catch (e) {
    if (e.name === 'MongoError' && e.code === 11000)
      return next(
        new AppError(`${email} already exists. Please try a new one!`, 404)
      );
    throw e;
  }

  const authToken = user.createAuthToken();
  // if i don't use { validateBeforeSave: false } then it checks for all the fields again
  // the problem I had was that confirmPassword was being required for saving!
  await user.save({ validateBeforeSave: false });

  await new sendEmail(user, `${linkToRedirect}/${authToken}`).sendSignUpEmail();
  res.status(200).json({
    status: 'Success',
    data: 'A Confirmation Email has been sent to your Email. Please check your inbox'
  });
});

exports.sendLoginEmail = catchAsync(async (req, res, next) => {
  //    0) Get the email and password from the req.header
  const { email, password, linkToRedirect } = req.body;
  if (!email || !password) {
    return next(new AppError('Please provide both email and password', 404));
  }

  //    1) Get the user from db based on email
  const user = await UserModel.findOne({ email }).select('+password');
  if (!user) {
    return next(new AppError('Your password or email does not match!', 404));
  }

  //    2) Check password if both passwords same,
  const isSamePassword = await user.comparePassword(password, user.password);
  if (!isSamePassword) {
    return next(new AppError('Your password or email does not match!', 404));
  }

  const generatedToken = user.createAuthToken();
  await user.save({ validateBeforeSave: false });

  await new sendEmail(
    user,
    `${linkToRedirect}/${generatedToken}`
  ).sendLoginEmail();
  res.status(200).json({
    status: 'Success',
    data: 'A Confirmation Email has been sent to your email. Please Check your inbox'
  });
});

// it will give us a user based on the token given to it!
const acceptUserAuthTokens = async ({ userToken }) => {
  //    1) Grab the token from the req and generated
  if (!userToken)
    throw new AppError('You have not provided a required auth token!', 404);

  const authToken = crypto.createHash('sha256').update(userToken).digest('hex');
  const user = await UserModel.findOne({ authToken }).select(
    '+authTokenTimeOut'
  );

  if (!user) throw new AppError('No User with this auth token', 404);
  if (Date.now() > user.authTokenTimeOut)
    throw new AppError(
      'This token has expired. It is valid for only 10 minutes',
      404
    );

  user.authToken = undefined;
  user.authTokenTimeOut = undefined;
  user.isVerified = true;
  await user.save({ validateBeforeSave: false });

  return user;
};

exports.signUp = catchAsync(async (req, res, next) => {
  const user = await acceptUserAuthTokens({ userToken: req.params.token });
  // TODO: correct the link
  await new sendEmail(user, `/upload-photo`).sendWelcome();
  generateToken(user, res);
});

exports.login = catchAsync(async (req, res, next) => {
  generateToken(
    await acceptUserAuthTokens({ userToken: req.params.token }),
    res
  );
});

exports.logout = (req, res, next) =>
  res.status(200).json({ status: 'Success', token: '' });

exports.forgotPassword = catchAsync(async (req, res, next) => {
  //    1) Get the email from the body, if email does not exist than send back an error
  const { email } = req.body;
  const user = await UserModel.findOne({ email });
  if (!email || !user)
    return next(new AppError('Please provide required Email!', 404));

  //    2) Generate a forgotPassword token and it will be valid for 10 minutes and send them as email,
  //      forgotPasswordToken should be encrypted before saving it to the database.
  //      there should be a separate field for passwordResetTokenTimeOut which should be 10 minutes after the time token is created!
  const token = user.createPasswordResetToken();
  user.save();

  // TODO: correct the link
  await new sendEmail(user, `/reset-password/${token}`).sendPasswordReset(
    token
  );

  res.status(200).json({
    status: 'Success',
    message: 'Check your email for password reset!'
  });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  //    1) Grab the token from the req and generate passwordResetToken
  const userToken = req.params.token;
  if (!userToken)
    return next(
      new AppError(
        'You have not provided a required reset Password token!',
        404
      )
    );

  const passwordResetToken = crypto
    .createHash('sha256')
    .update(userToken)
    .digest('hex');
  if (userToken !== passwordResetToken)
    return next(new AppError('Your token is invalid.', 404));

  //    2) Check if user with passwordResetToken exists in the db, if no send back an error.
  let user = await UserModel.findOne({ passwordResetToken }).select(
    'passwordResetToken passwordResetTokenTimeOut'
  );

  if (!user) return next(new AppError('No User with this reset Token', 404));

  //    3) Check if passwordResetTokenTimeOut is not greater than now, if yes, send back an error
  if (Date.now() > user.passwordResetTokenTimeOut)
    return next(new AppError('This Token has expired!', 404));

  //    4) Grab the password and confirmPassword and then assign the user with the password.
  const { password, confirmPassword } = req.body;
  if (!password || !confirmPassword)
    return next(
      new AppError('Please provide both password and confirm Password')
    );

  user.password = password;
  user.confirmPassword = confirmPassword;
  user.changePasswordAt = Date.now();
  user.passwordResetToken = undefined;
  user.passwordResetTokenTimeOut = undefined;
  user = await user.save();

  //    5) Create the JWT Token and send it to the user
  generateToken(user, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  //    1) Grab the user
  let user = req.user;

  //    2) Grab the current password from the req.body of logged User, if it is not same then send an error!
  const { currentPassword, password, confirmPassword } = req.body;
  if (!currentPassword || !password || !confirmPassword)
    return next(
      new AppError(
        'Please provide all of the required fields Current Password, Password and Confirm Password!',
        404
      )
    );
  const isPasswordValid = await user.comparePassword(
    currentPassword,
    user.password
  );

  //    3) Update the password
  if (!isPasswordValid)
    return next(new AppError('Your password is incorrect', 404));

  user.password = password;
  user.confirmPassword = confirmPassword;

  user = await user.save({ new: true, runValidators: true });
  res.status(200).json({
    status: 'Success',
    user
  });
});
