import express from 'express';
import * as authHandler from '../handlers/authHandler';
import * as userHandler from '../handlers/userHandler';
import * as multerHandler from '../handlers/multerHandler';

const userRouter = express.Router();

userRouter.post('/sendSignUpEmail', authHandler.sendSignUpEmail);
userRouter.post('/sendLoginEmail', authHandler.sendLoginEmail);

userRouter.get('/login/:token', authHandler.login);
userRouter.get('/signup/:token', authHandler.signUp);

userRouter.post('/forgotPassword', authHandler.forgotPassword);
userRouter.get('/resetPassword/:token', authHandler.resetPassword);

userRouter.post('/simpleLogin786', authHandler.simpleLogin);

// <------------------ Please Login to Continue ---------------------------->
userRouter.use(authHandler.protect); // All the requests beyond are needed to be authenticated

userRouter.post('/verifyToken', authHandler.verifyToken);

userRouter.get('/logout', authHandler.logout);

userRouter.get('/getMe', userHandler.getMe);
userRouter.put('/updatePassword', authHandler.updatePassword);
userRouter.put(
  '/updateMe',
  authHandler.restrictTo('user', 'admin'),
  multerHandler.userSingleUpload,
  multerHandler.resizeUserPhoto,
  userHandler.updateMe
);

userRouter.delete('/deleteMe', userHandler.deleteMe);

// <------------- Admin Routes ----------->
userRouter.use(authHandler.restrictTo('admin'));
userRouter.route('/').get(userHandler.getAllUsers);
userRouter
  .route('/:id')
  .put(userHandler.updateUser)
  .get(userHandler.getUserById)
  .delete(userHandler.deleteUser);

export = userRouter;
