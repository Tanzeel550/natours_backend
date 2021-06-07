"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const mongoose_1 = require("mongoose");
const validator_1 = __importDefault(require("validator"));
const crypto_1 = __importDefault(require("crypto"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const userSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, 'Name is required']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: [true, 'Your email already exists!'],
        validate: [validator_1.default.isEmail, 'Please Provide a valid Email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        select: false,
        minLength: 8
    },
    confirmPassword: {
        type: String,
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
        type: Number,
        default: undefined,
        select: false
    },
    isDeleted: {
        type: Boolean,
        default: false,
        select: false
    },
    changedPasswordAt: {
        type: Number,
        default: Date.now(),
        select: false
    },
    authToken: {
        type: String,
        default: undefined,
        select: false
    },
    authTokenTimeOut: {
        type: Number,
        default: undefined,
        select: false
    },
    isVerified: {
        type: Boolean,
        default: false,
        select: true
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
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
    const user = this;
    if (user.isModified('password')) {
        try {
            user.password = await bcrypt_1.default.hash(user.password, 10);
            user.confirmPassword = undefined;
        }
        catch (e) {
            console.log(e);
        }
    }
    next();
});
userSchema.methods.comparePassword = async function (candidatePassword, hashedPassword) {
    return await bcrypt_1.default.compare(candidatePassword, hashedPassword);
};
userSchema.methods.createAuthToken = function () {
    const randomString = crypto_1.default.randomBytes(16).toString('hex');
    const token = crypto_1.default.createHash('sha256').update(randomString).digest('hex');
    this.authToken = token;
    this.authTokenTimeOut = Date.now() + 10 * 60 * 1000;
    return randomString;
};
userSchema.methods.createPasswordResetToken = function () {
    const randomString = crypto_1.default.randomBytes(16).toString('hex');
    const token = crypto_1.default.createHash('sha256').update(randomString).digest('hex');
    this.passwordResetToken = token;
    this.passwordResetTokenTimeOut = Date.now() + 10 * 60 * 1000;
    return randomString;
};
userSchema.methods.isAfter = function (JWTTimeStamp) {
    if (this.changedPasswordAt) {
        return this.changedPasswordAt / 1000 > JWTTimeStamp;
    }
    return false;
};
const UserModel = mongoose_1.model('users', userSchema);
module.exports = UserModel;
