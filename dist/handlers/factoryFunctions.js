"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkBody = exports.deleteOne = exports.updateOne = exports.createOne = exports.getOne = exports.getAll = void 0;
const catchAsync_1 = __importDefault(require("../utils/catchAsync"));
const APIFeatures_1 = __importDefault(require("../utils/APIFeatures"));
const AppError_1 = __importDefault(require("../utils/AppError"));
const getAll = (model) => {
    return catchAsync_1.default(async (req, res, next) => {
        let query = new APIFeatures_1.default(model.find(), req.query)
            .filter()
            .limitFields()
            .paginationAndLimitation()
            .sort().query;
        let doc = await query;
        res.status(200).json({
            status: 'Success',
            length: doc.length,
            data: {
                data: doc
            }
        });
    });
};
exports.getAll = getAll;
const getOne = (model) => {
    return catchAsync_1.default(async (req, res, next) => {
        let doc;
        try {
            doc = await model.findById(req.params.id);
        }
        catch (e) { }
        if (!doc) {
            return next(new AppError_1.default('No such document found with this ID', 404));
        }
        res.status(200).json({
            status: 'Success',
            data: {
                data: doc
            }
        });
    });
};
exports.getOne = getOne;
const createOne = (model) => {
    return catchAsync_1.default(async (req, res, next) => {
        const doc = await model.create(req.body);
        res.status(200).json({
            status: 'Success',
            data: {
                data: doc
            }
        });
    });
};
exports.createOne = createOne;
const updateOne = (model) => {
    return catchAsync_1.default(async (req, res, next) => {
        const doc = await model.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!doc)
            return next(new AppError_1.default('No such document found with this ID', 404));
        res.status(200).json({
            status: 'Success',
            data: { doc }
        });
    });
};
exports.updateOne = updateOne;
const deleteOne = (model) => {
    return catchAsync_1.default(async (req, res, next) => {
        await model.findByIdAndRemove(req.params.id);
        res.status(204).json({});
    });
};
exports.deleteOne = deleteOne;
const checkBody = () => {
    return catchAsync_1.default(async (req, res, next) => {
        if (Object.keys(req.body).length === 0)
            return next(new AppError_1.default('Body is No provided', 404));
        next();
    });
};
exports.checkBody = checkBody;
