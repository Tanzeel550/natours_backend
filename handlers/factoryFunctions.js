const catchAsync = require('./../utils/catchAsync');
const APIFeatures = require('./../utils/APIFeatures');
const AppError = require('./../utils/AppError');

exports.getAll = Model =>
  catchAsync(async (req, res, next) => {
    let query = new APIFeatures(Model.find(), req.query)
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

exports.getOne = Model =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);

    if (req.toBePopulatedWith) {
      req.toBePopulatedWith.forEach(item => query.populate(item));
    }
    const doc = await query;
    if (!doc) {
      return next(new AppError('No such document found with this ID', 404));
    }

    res.status(200).json({
      status: 'Success',
      data: {
        data: doc
      }
    });
  });

exports.createOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);
    res.status(200).json({
      status: 'Success',
      data: {
        data: doc
      }
    });
  });

exports.updateOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!doc)
      return next(new AppError('No such document found with this ID', 404));
    res.status(200).json({
      status: 'Success',
      data: { doc }
    });
  });

exports.deleteOne = Model =>
  catchAsync(async (req, res, next) => {
    await Model.findByIdAndDelete(req.params.id);
    res.status(204).json({});
  });

exports.checkBody = () =>
  catchAsync(async (req, res, next) => {
    if (Object.keys(req.body).length === 0)
      return next(new AppError('Body is No provided', 404));
    next();
  });

exports.populateWith =
  (...args) =>
  (req, res, next) => {
    req.toBePopulatedWith = args;
    next();
  };
