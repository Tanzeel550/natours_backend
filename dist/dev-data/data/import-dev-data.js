"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const mongoose = require('mongoose');
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: './../../config.env' });
const TourModel = require('../../models/tourModel');
const UserModel = require('../../models/userModel');
const ReviewModel = require('../../models/reviewModel');
const DB = process.env.MONGODB_URL;
console.log(DB);
mongoose
    .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: true,
    useUnifiedTopology: true
})
    .then(() => {
    console.log('DB Connections was success full');
})
    .catch((err) => {
    console.log(err);
});
const tours = JSON.parse(fs_1.default.readFileSync(__dirname + '/tours.json', 'utf-8'));
const users = JSON.parse(fs_1.default.readFileSync(__dirname + '/users.json', 'utf-8'));
const reviews = JSON.parse(fs_1.default.readFileSync(__dirname + '/reviews.json', 'utf-8'));
const importData = async () => {
    try {
        await TourModel.create(tours);
        await UserModel.create(users);
        await ReviewModel.create(reviews);
        console.log('Data successfully loaded!');
    }
    catch (e) {
        console.log(e);
    }
    process.exit();
};
const deleteData = async () => {
    try {
        await TourModel.deleteMany();
        await UserModel.deleteMany();
        await ReviewModel.deleteMany();
    }
    catch (e) {
        console.log(e);
    }
    process.exit();
};
if (process.argv[2] === '--import') {
    importData().then(() => {
        console.log('Data successfully imported');
    });
}
else if (process.argv[2] === '--delete') {
    deleteData().then(() => {
        console.log('Data successfully deleted');
    });
}
