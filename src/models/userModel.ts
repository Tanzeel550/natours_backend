import {
  HookNextFunction,
  Model,
  model,
  MongooseDocument,
  Query,
  Schema
} from 'mongoose';
import { UserDocumentType } from '../types/authTypes';
import validator from 'validator';
import crypto from 'crypto';
import bcrypt from 'bcrypt';

const userSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: [true, 'Your email already exists!'],
      validate: [validator.isEmail, 'Please Provide a valid Email']
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      select: false,
      minLength: 8
    },
    confirmPassword: {
      type: String,
      required: [true, 'Confirm Password is required'],
      validate: {
        validator: function (this: UserDocumentType, value: string) {
          return value === this.password;
        },
        message: 'Your passwords do not match!'
      },
      select: false
    },
    role: {
      type: String,
      default: 'user',
      enum: {
        values: ['admin', 'guide', 'lead-guide', 'user'],
        message: 'Role must be one of Admin, Guide or User'
      }
    },
    photo: {
      type: String,
      default: 'default.jpg'
    },
    passwordResetToken: {
      type: String,
      default: undefined,
      select: false
    },
    passwordResetTokenTimeOut: {
      type: Number, // No. will be representing the milliseconds at which token timesOut
      default: undefined,
      select: false
    },
    isDeleted: {
      type: Boolean,
      default: false,
      select: false
    },
    changedPasswordAt: {
      type: Number, // Number will represent milliseconds
      default: Date.now(),
      select: false
    },
    authToken: {
      type: String,
      default: undefined,
      select: false
    },
    authTokenTimeOut: {
      type: Number, // No. will be representing the milliseconds at which token timesOut
      default: undefined,
      select: false
    },
    isVerified: {
      type: Boolean,
      default: false,
      select: true
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

userSchema.virtual('reviews', {
  ref: 'reviews',
  localField: '_id',
  foreignField: 'user'
});

// Todo: Change the type of pre in mongoose.index.d.ts to (string | RegExp)
//  so that we can also use RegExp or use @ts-ignore

userSchema.pre(/^find/, function (next: HookNextFunction) {
  // @ts-ignore
  const doc: Model<UserDocumentType> = this;
  doc.find({ isDeleted: { $ne: true } });
  next();
});

userSchema.pre('save', async function (next: HookNextFunction) {
  // @ts-ignore
  const user: MongooseDocument & UserDocumentType = this;
  if (user.isModified('password')) {
    try {
      user.password = await bcrypt.hash(user.password, 10);
      user.confirmPassword = undefined;
    } catch (e) {
      console.log(e);
    }
  }
  next();
});

userSchema.methods.comparePassword = async function (
  candidatePassword: string,
  hashedPassword: string
) {
  return await bcrypt.compare(candidatePassword, hashedPassword);
};

userSchema.methods.createAuthToken = function () {
  const randomString = crypto.randomBytes(16).toString('hex');
  const token = crypto.createHash('sha256').update(randomString).digest('hex');

  this.authToken = token;
  this.authTokenTimeOut = Date.now() + 10 * 60 * 1000;

  return randomString;
};

userSchema.methods.createPasswordResetToken = function () {
  const randomString = crypto.randomBytes(16).toString('hex');
  const token = crypto.createHash('sha256').update(randomString).digest('hex');

  this.passwordResetToken = token;
  this.passwordResetTokenTimeOut = Date.now() + 10 * 60 * 1000; // 10 minutes

  return randomString;
};

// if user.changePasswordAt is greater than token.iat (user.changePasswordAt < token.iat)
// then it means that the token is old. we have to login
// again to get new token so that
// token.iat > user.changePasswordAt
userSchema.methods.isAfter = function (
  this: UserDocumentType,
  JWTTimeStamp: number
) {
  if (this.changedPasswordAt) {
    // iat is in seconds so we convert user.changePasswordAt to seconds
    return this.changedPasswordAt / 1000 > JWTTimeStamp;
  }
  return false;
};

const UserModel = model<UserDocumentType>('users', userSchema);

export default UserModel;
