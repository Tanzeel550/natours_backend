"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePassword = exports.resetPassword = exports.forgotPassword = exports.logout = exports.login = exports.signUp = exports.sendLoginEmail = exports.sendSignUpEmail = exports.restrictTo = exports.verifyToken = exports.protect = void 0;
const crypto_1 = __importDefault(require("crypto"));
const userModel_1 = __importDefault(require("../models/userModel"));
const catchAsync_1 = __importDefault(require("../utils/catchAsync"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const AppError_1 = __importDefault(require("../utils/AppError"));
const sendEmail_1 = __importDefault(require("../utils/sendEmail"));
const generateToken = (user, res) => {
    const token = jsonwebtoken_1.default.sign({ id: user.id }, process.env.JWT_SECRET_KEY, {
        expiresIn: process.env.JWT_EXPIRY
    });
    user.password = undefined;
    return res
        .status(200)
        .cookie('token', token, {
        httpOnly: true,
        expires: new Date(Date.now() + Number(process.env.JWT_EXPIRY_INT) * 24 * 60 * 60 * 1000)
    })
        .json({
        status: 'Success',
        token,
        user
    });
};
exports.protect = catchAsync_1.default(async (req, res, next) => {
    let token;
    if (req.cookies.token)
        token = req.cookies.token;
    else if (req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer'))
        token = req.headers.authorization.split(' ')[1];
    else
        token = undefined;
    if (!token)
        return next(new AppError_1.default('Your token is invalid. Please login again!', 404));
    const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET_KEY);
    const { id, iat } = decoded;
    const user = await userModel_1.default.findById(id).select('+password +changePasswordAt');
    if (!user)
        return next(new AppError_1.default('Your Email does not exist', 404));
    if (!user.isVerified)
        return next(new AppError_1.default('Your Email is not verified', 404));
    const isAfter = user.isAfter(iat);
    if (isAfter)
        return next(new AppError_1.default('Please Login again. Your password is changed', 404));
    req.body.user = user;
    next();
});
exports.verifyToken = catchAsync_1.default(async (req, res, next) => generateToken(req.body.user, res));
const restrictTo = (...args) => {
    return (req, res, next) => {
        const user = req.body.user;
        const isAuth = args.includes(user.role);
        if (isAuth) {
            return next();
        }
        else {
            return next(new AppError_1.default('You are not authorized to get access', 404));
        }
    };
};
exports.restrictTo = restrictTo;
exports.sendSignUpEmail = catchAsync_1.default(async (req, res, next) => {
    const { name, email, password, confirmPassword, linkToRedirect } = req.body;
    let user = await userModel_1.default.create({
        name,
        email,
        password,
        confirmPassword
    });
    const authToken = user.createAuthToken();
    await user.save({ validateBeforeSave: false });
    await new sendEmail_1.default(user, `${linkToRedirect}/${authToken}`).sendSignUpEmail();
    res.status(200).json({
        status: 'Success',
        data: 'A Confirmation Email has been sent to your Email. Please check your inbox'
    });
});
exports.sendLoginEmail = catchAsync_1.default(async (req, res, next) => {
    const { email, password, linkToRedirect } = req.body;
    if (!email || !password) {
        return next(new AppError_1.default('Please provide both email and password', 404));
    }
    const user = await userModel_1.default.findOne({ email }).select('+password');
    if (!user) {
        return next(new AppError_1.default('Your password or email does not match!', 404));
    }
    const isSamePassword = await user.comparePassword(password, user.password);
    if (!isSamePassword) {
        return next(new AppError_1.default('Your password or email does not match!', 404));
    }
    const generatedToken = user.createAuthToken();
    await user.save({ validateBeforeSave: false });
    await new sendEmail_1.default(user, `${linkToRedirect}/${generatedToken}`).sendLoginEmail();
    res.status(200).json({
        status: 'Success',
        data: 'A Confirmation Email has been sent to your email. Please Check your inbox'
    });
});
const acceptUserAuthTokens = async (userToken) => {
    if (!userToken)
        throw new AppError_1.default('You have not provided a required auth token!', 404);
    const authToken = crypto_1.default.createHash('sha256').update(userToken).digest('hex');
    const user = await userModel_1.default.findOne({ authToken }).select('+authTokenTimeOut');
    if (!user)
        throw new AppError_1.default('No User with this auth token', 404);
    if (Date.now() > user.authTokenTimeOut)
        throw new AppError_1.default('This token has expired. It is valid for only 10 minutes', 404);
    user.authToken = undefined;
    user.authTokenTimeOut = undefined;
    user.isVerified = true;
    await user.save({ validateBeforeSave: false });
    return user;
};
exports.signUp = catchAsync_1.default(async (req, res, next) => {
    const user = await acceptUserAuthTokens(req.params.token);
    await new sendEmail_1.default(user, `/upload-photo`).sendWelcome();
    generateToken(user, res);
});
exports.login = catchAsync_1.default(async (req, res, next) => {
    generateToken(await acceptUserAuthTokens(req.params.token), res);
});
const logout = (req, res, next) => res.status(200).json({ status: 'Success', token: '' });
exports.logout = logout;
exports.forgotPassword = catchAsync_1.default(async (req, res, next) => {
    const { email } = req.body;
    const user = await userModel_1.default.findOne({ email });
    if (!email || !user)
        return next(new AppError_1.default('Please provide required Email!', 404));
    const token = user.createPasswordResetToken();
    user.save();
    await new sendEmail_1.default(user, `/reset-password/${token}`).sendPasswordReset();
    res.status(200).json({
        status: 'Success',
        message: 'Check your email for password reset!'
    });
});
exports.resetPassword = catchAsync_1.default(async (req, res, next) => {
    const userToken = req.params.token;
    if (!userToken)
        return next(new AppError_1.default('You have not provided a required reset Password token!', 404));
    const passwordResetToken = crypto_1.default
        .createHash('sha256')
        .update(userToken)
        .digest('hex');
    if (userToken !== passwordResetToken)
        return next(new AppError_1.default('Your token is invalid.', 404));
    let user = await userModel_1.default.findOne({ passwordResetToken }).select('passwordResetToken passwordResetTokenTimeOut');
    if (!user)
        return next(new AppError_1.default('No User with this reset Token', 404));
    if (Date.now() > user.passwordResetTokenTimeOut)
        return next(new AppError_1.default('This Token has expired!', 404));
    const { password, confirmPassword } = req.body;
    if (!password || !confirmPassword)
        return next(new AppError_1.default('Please provide both password and confirm Password', 404));
    user.password = password;
    user.confirmPassword = confirmPassword;
    user.changedPasswordAt = Date.now();
    user.passwordResetToken = undefined;
    user.passwordResetTokenTimeOut = undefined;
    user = await user.save();
    generateToken(user, res);
});
exports.updatePassword = catchAsync_1.default(async (req, res, next) => {
    let user = req.body.user;
    const { currentPassword, password, confirmPassword } = req.body;
    if (!currentPassword || !password || !confirmPassword)
        return next(new AppError_1.default('Please provide all of the required fields Current Password, Password and Confirm Password!', 404));
    const isPasswordValid = await user.comparePassword(currentPassword, user.password);
    if (!isPasswordValid)
        return next(new AppError_1.default('Your password is incorrect', 404));
    user.password = password;
    user.confirmPassword = confirmPassword;
    user = await user.save({ new: true, runValidators: true });
    res.status(200).json({
        status: 'Success',
        user
    });
});
