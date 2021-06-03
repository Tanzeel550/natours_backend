const { Schema, model } = require('mongoose');
const validator = require('validator');
const crypto = require('crypto');
const bcrypt = require('bcrypt');

const userSchema = new Schema(
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
        validator: function (value) {
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
      type: Date,
      default: undefined,
      select: false
    },
    isDeleted: {
      type: Boolean,
      default: false,
      select: false
    },
    changePasswordAt: {
      type: Date,
      default: Date.now(),
      select: false
    },
    authToken: {
      type: String,
      default: undefined,
      select: false
    },
    authTokenTimeOut: {
      type: Date,
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

userSchema.pre(/^find/, function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    try {
      this.password = await bcrypt.hash(this.password, 10);
      this.confirmPassword = undefined;
    } catch (e) {
      console.log(e);
    }
  }
  next();
});

userSchema.methods.comparePassword = async function (
  candidatePassword,
  hashedPassword
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
  this.passwordResetTokenTimeOut = Date.now() + 10 * 60 * 1000;

  return randomString;
};

// if user.changePasswordAt is greater than token.iat (user.changePasswordAt < token.iat)
// then it means that the token is old. we have to login
// again to get new token so that
// token.iat > user.changePasswordAt
userSchema.methods.isAfter = function (JWTTimeStamp) {
  if (this.changePasswordAt) {
    // iat is in seconds so we convert user.changePasswordAt to seconds
    return Date.parse(this.changePasswordAt) / 1000 > JWTTimeStamp;
  }
  return false;
};

const UserModel = model('users', userSchema);

module.exports = UserModel;
