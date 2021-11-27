const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const User = require('../models/userModel');
const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utilis/catchAsync');
const ApiError = require('../utilis/apierror');

exports.getOverView = catchAsync(async (req, res, next) => {
  //read the data from the database
  const tours = await Tour.find();
  res.status(200).render('overview', { title: 'All Tours', tours });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    select: 'review rating user',
  });
  if (!tour) return next(new ApiError('There is no tour with that name', 404));
  console.log(tour.reviews);
  res.status(200).render('tour', { title: `${tour.name}`, tour });
});

exports.getSignUpForm = (req, res) => {
  res.status(200).render('signup', { title: 'Create your account' });
};

exports.getLoginForm = (req, res) => {
  res.status(200).render('login', { title: 'Log in to your account' });
};

exports.getAccount = (req, res) => {
  res.status(200).render('account', { title: 'Account Details' });
};

exports.getMyTours = catchAsync(async (req, res) => {
  const bookings = await Booking.find({ user: req.user.id });
  const tourIds = bookings.map((el) => el.tour);
  const tours = await Tour.find({ _id: { $in: tourIds } });
  res.status(200).render('overview', { title: 'My Tours', tours });
});
