const multer = require('multer');
const sharp = require('sharp');
const Tour = require('../models/tourModel');
const ApiError = require('../utilis/apierror');
const catchSync = require('../utilis/catchAsync');
const handlerFactory = require('./handlerFactory');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new ApiError('Not an image! Plese upload only images', 400), false);
  }
};

const upload = multer({ multerStorage, multerFilter });
exports.uploadTourImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 },
]);

exports.resizeTourImages = catchSync(async (req, res, next) => {
  if (!req.files.imageCover || !req.files.images) return false;

  //Image cover
  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;

  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.body.imageCover}`);

  req.body.images = [];
  Promise.all(
    req.files.images.map(async (img, index) => {
      req.body.images[index] = `tour-${req.params.id}-${Date.now()}-${
        index + 1
      }.jpeg`;

      await sharp(img.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${req.body.images[index]}`);
    })
  );

  next();
});

exports.aliasTopTours = function (req, res, next) {
  req.query.limit = 5;
  req.query.sort = '-ratingsAverage,price';
  req.query.field = 'name,duration,price,summary,difficulty,ratingsAverage';
  next();
};
exports.getAllTours = handlerFactory.getAll(Tour);
exports.getTour = handlerFactory.getOne(Tour, { path: 'reviews' });
exports.createTour = handlerFactory.createOne(Tour);
exports.updateTour = handlerFactory.updateOne(Tour);
exports.deleteTour = handlerFactory.deleteOne(Tour);

exports.getStats = catchSync(async (req, res, next) => {
  // try {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        noOfTours: { $sum: 1 },
        noOfRating: { $sum: 'ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        maxprice: { $max: '$price' },
        minprice: { $min: '$price' },
      },
    },
    {
      $sort: { avgPrice: 1 },
    },
    // {
    //   $match: { _id: { $ne: 'EASY' } },
    // },
  ]);
  res.status(200).json({
    status: 'Success',
    requestTime: req.requestTime,
    data: { stats },
  });
  // } catch (err) {
  //   res.status(404).json({ status: 'fail', message: err });
  // }
});

exports.getMonthTours = catchSync(async (req, res, next) => {
  // try {
  const { year } = req.params;
  const tours = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year + 1}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        noOfTourStarts: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: { noOfTourStarts: -1 },
    },
    {
      $limit: 1,
    },
  ]);
  res
    .status(200)
    .json({ status: 'sucess', result: tours.length, data: { tours } });
  // } catch (err) {
  //   res.status(404).json({ status: 'fail', message: err });
  // }
});

// /tours-within/:distance/center/:latlng/unit/:unit
exports.getToursWithIn = catchSync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1; //Converting distance to radiants units
  if (!lat || !lng) {
    return next(new ApiError('Please provide latitude and longitude', 400));
  }
  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });
  res.status(200).json({
    status: 'Success',
    result: tours.length,
    data: { data: tours },
  });
});
exports.getGeoDistance = catchSync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  if (!lat || !lng) {
    return next(new ApiError('Please provide latitude and longitude', 400));
  }
  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;
  const distance = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);
  res.status(200).json({
    status: 'Success',
    data: { data: distance },
  });
});
