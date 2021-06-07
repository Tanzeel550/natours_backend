"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
let CONNECTION_STRING;
if (process.env.NODE_ENV === 'production') {
    CONNECTION_STRING = process.env.DATABASE_CONNECTION_STRING.replace('<password>', process.env.DATABASE_PASSWORD);
}
else {
    CONNECTION_STRING = process.env.MONGODB_URL;
}
const params = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
};
mongoose_1.default
    .connect(CONNECTION_STRING, params)
    .then(() => {
    console.log('App has connected to the database');
})
    .catch((err) => {
    console.error(err);
});
