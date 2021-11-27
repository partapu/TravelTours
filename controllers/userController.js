const multer = require('multer');
const sharp = require('sharp');
const User = require('../models/userModel');
const catchSync = require('../utilis/catchAsync');
const ApiError = require('../utilis/apierror');
const handlerFactory = require('./handlerFactory');
const catchAsync = require('../utilis/catchAsync');

// const multerStorage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, 'public/img/users');
//   },
//   filename: function (req, file, cb) {
//     const ext = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`); //File name
//   },
// });

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new ApiError('Not an image! Plese upload only images', 400), false);
  }
};

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserImage = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);
  next();
});

const filterObj = function (obj, ...allowedFileds) {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFileds.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};
//Routehandlers
exports.getAllUsers = handlerFactory.getAll(User);
exports.createUser = (req, res) => {
  res.status(500).json({ status: 500, message: 'Route is not defined' });
};
exports.getUser = handlerFactory.getOne(User);
exports.updateUser = handlerFactory.updateOne(User);
exports.deleteUser = handlerFactory.deleteOne(User);

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};
exports.updateMe = catchSync(async (req, res, next) => {
  //Password should not be update through this route

  // console.log(req.file);
  // console.log(req.body);

  if (req.body.password || req.body.passwordConfirm)
    return next(
      new ApiError('Password cannot be updated through this route', 400)
    );
  const filterBody = filterObj(req.body, 'name', 'email');
  if (req.file) filterBody.photo = req.file.filename;
  console.log(filterBody);
  const newUser = await User.findByIdAndUpdate(req.user.id, filterBody, {
    new: true,
    runValidators: true,
  });
  if (!newUser) return next(new ApiError('Photo no found', 404));
  console.log(newUser);
  // const user = await User.findById(req.user.id);
  // user.email = req.body.email;
  // await user.save({ validateBeforeSave: false });
  res.status(200).json({ status: 'success', message: 'User data is updated' });
});
exports.deleteMe = catchSync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res
    .status(204)
    .json({ status: 'success', message: 'Your account is deleted' });
});
