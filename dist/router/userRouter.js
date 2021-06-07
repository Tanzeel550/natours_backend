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
const express_1 = __importDefault(require("express"));
const authHandler = __importStar(require("../handlers/authHandler"));
const userHandler = __importStar(require("../handlers/userHandler"));
const multerHandler = __importStar(require("../handlers/multerHandler"));
const userRouter = express_1.default.Router();
userRouter.post('/sendSignUpEmail', authHandler.sendSignUpEmail);
userRouter.post('/sendLoginEmail', authHandler.sendLoginEmail);
userRouter.get('/login/:token', authHandler.login);
userRouter.get('/signup/:token', authHandler.signUp);
userRouter.post('/forgotPassword', authHandler.forgotPassword);
userRouter.get('/resetPassword/:token', authHandler.resetPassword);
userRouter.use(authHandler.protect);
userRouter.post('/verifyToken', authHandler.verifyToken);
userRouter.get('/logout', authHandler.logout);
userRouter.get('/getMe', userHandler.getMe);
userRouter.put('/updatePassword', authHandler.updatePassword);
userRouter.put('/updateMe', authHandler.restrictTo('user', 'admin'), multerHandler.userSingleUpload, multerHandler.resizeUserPhoto, userHandler.updateMe);
userRouter.delete('/deleteMe', userHandler.deleteMe);
userRouter.use(authHandler.restrictTo('admin'));
userRouter.route('/').get(userHandler.getAllUsers);
userRouter
    .route('/:id')
    .put(userHandler.updateUser)
    .get(userHandler.getUserById)
    .delete(userHandler.deleteUser);
module.exports = userRouter;
