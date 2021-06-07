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
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkBody = exports.updateUser = exports.deleteUser = exports.getUserById = exports.getAllUsers = exports.getMe = exports.deleteMe = exports.updateMe = void 0;
const catchAsync_1 = __importDefault(require("../utils/catchAsync"));
const AppError_1 = __importDefault(require("../utils/AppError"));
const userModel_1 = __importDefault(require("../models/userModel"));
const factoryFunctions = __importStar(require("./factoryFunctions"));
exports.updateMe = catchAsync_1.default(async (req, res, next) => {
    let { body } = req;
    if (body.password || body.confirmPassword)
        return next(new AppError_1.default('This route is not for updating password', 404));
    const updatedUser = await userModel_1.default.findByIdAndUpdate(req.body.user.id, req.body, {
        runValidators: true,
        new: true
    }).select('-password -createdAt -changePasswordAt');
    res.status(200).json({
        status: 'Success',
        data: updatedUser
    });
});
exports.deleteMe = catchAsync_1.default(async (req, res, next) => {
    let user = req.body.user;
    await user.updateOne({ isDeleted: true }, { runValidators: true });
    res.status(204).json({
        status: 'Success'
    });
});
const getMe = (req, res) => {
    res.status(200).json({
        status: 'Success',
        user: req.body.user
    });
};
exports.getMe = getMe;
exports.getAllUsers = factoryFunctions.getAll(userModel_1.default);
exports.getUserById = factoryFunctions.getOne(userModel_1.default);
exports.deleteUser = factoryFunctions.deleteOne(userModel_1.default);
exports.updateUser = factoryFunctions.updateOne(userModel_1.default);
exports.checkBody = factoryFunctions.checkBody();
