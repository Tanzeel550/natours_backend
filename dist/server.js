"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
require("./connectDB");
const port = process.env.PORT || 8000;
const server = app_1.default.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
process.on('unhandledRejection', (err) => {
    console.log('UNHANDLED REJECTION 👺 SHUTTING DOWN GRACEFULLY');
    console.log(err.name, err.message);
    server.close(() => {
        process.exit(1);
    });
});
process.on('SIGTERM', () => {
    console.log('😓 SIGTERM received. We are closing now');
    server.close(() => {
        console.log('👺 The server has closed');
    });
});
