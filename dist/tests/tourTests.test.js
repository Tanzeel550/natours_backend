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
require("./../connectDB");
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../app"));
const mongoose = __importStar(require("mongoose"));
test('get all tours', (done) => {
    supertest_1.default(app_1.default)
        .get('/api/v1/tours')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, response) => {
        const serverResponse = JSON.parse(response.text);
        expect(serverResponse).toHaveLength(9);
        done();
    });
});
test('get one tour', (done) => {
    const id = '5c88fa8cf4afda39709c2955';
    supertest_1.default(app_1.default)
        .get(`/api/v1/tours/${id}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, response) => {
        if (err)
            console.log(err);
        const serverResponse = JSON.parse(response.text);
        const data = serverResponse.data.data;
        expect(data.name).toMatch('The Sea Explorer');
        expect(data.locations).toHaveLength(4);
        expect(data.guides).toHaveLength(2);
        expect(data.guides[0].id).toBe('5c8a22c62f8fb814b56fa18b');
        expect(data.guides[1].id).toBe('5c8a1f4e2f8fb814b56fa185');
        expect(data.reviews).toHaveLength(6);
        done();
    });
});
test('get tour with invalid id', () => {
    if (process.env.NODE_ENV === 'production') {
    }
    supertest_1.default(app_1.default)
        .get(`/api/v1/tours/41224d776a326fb40f000001`)
        .expect(404)
        .expect('Content-Type', /json/)
        .end((err, response) => {
        if (err)
            console.log(err);
        const serverResponse = JSON.parse(response.text);
        expect(serverResponse.message).toMatch('No such document found with this ID');
    });
});
test('create tour with the given data', () => { });
afterAll(() => {
    mongoose.connection.close().then();
});
