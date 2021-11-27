const catchSync = require('../utilis/catchAsync');
const ApiError = require('../utilis/apierror');
const APIFeatures = require('../utilis/apiFeatures');

exports.deleteOne = (Model) =>
  catchSync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(new ApiError(`_id is not found`, 404));
    }
    res.status(204).json({
      status: 'Success',
      requestTime: req.requestTime,
      data: null,
    });
  });

exports.updateOne = (Model) =>
  catchSync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) {
      return next(new ApiError('Id not found', 404));
    }
    res.status(200).json({
      status: 'Success',
      requestTime: req.requestTime,
      data: { doc },
    });
  });

exports.createOne = (Model) =>
  catchSync(async (req, res, next) => {
    const doc = await Model.create(req.body);
    res.status(201).json({
      status: '201',
      requestTime: req.requestTime,
      data: doc,
    });
  });

exports.getOne = (Model, populateOption) =>
  catchSync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (populateOption) query = query.populate(populateOption);
    const doc = await query;
    if (!doc) {
      return next(new ApiError('document not found', 404));
    }
    res.status(200).json({
      staus: 'success',
      requestTime: req.requestTime,
      data: { doc },
    });
  });

exports.getAll = (Model) =>
  catchSync(async (req, res, next) => {
    //To allow for nested Get reviews on tour method
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };
    let feature = new APIFeatures(Model.find(filter), req.query);
    feature = feature.filter().sort().fieldOmitting().pagination();
    // const doc = await feature.query.explain();
    const doc = await feature.query;
    res.status(200).json({
      status: 200,
      results: doc.length,
      data: { doc },
    });
  });
