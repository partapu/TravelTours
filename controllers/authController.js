const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const crypto = require('crypto');
const User = require('../models/userModel');
const ApiError = require('../utilis/apierror');
const catchSync = require('../utilis/catchAsync');
const Email = require('../utilis/email');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const createAndSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const expireyTime = new Date(Date.now() + 30 * 24 * 3600000);
  console.log(expireyTime);
  const cookieOptions = {
    expires: new Date(Date.now() + 30 * 24 * 3600000),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions);

  user.password = undefined;
  res
    .status(statusCode)
    .json({ status: 'Success', token, data: { User: user } });
};
//SignUp will create a user recorde in User colection and generate the jwt token using userID and send it in the response
exports.SignUp = catchSync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    role: req.body.role,
  });
  const url = `${req.protocol}://${req.get('host')}/me`;
  await new Email(newUser, url).sendWelcome();
  createAndSendToken(newUser, 201, res);
});

//Login functions get the post request of the password and email, gets the user details from database by performing query search
//validate the password is matching or not
exports.login = catchSync(async (req, res, next) => {
  const { password, email } = req.body;
  console.log(password, email);
  //Check if Email and Password exist
  if (!password || !email) {
    return next(new ApiError('Please Provide Password and Email'), 400);
  }
  //check if user and password is correct
  const user = await User.findOne({ email }).select('+password'); //select is used to get the password because it is default set to select:false
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new ApiError('Incorrect Email or password', 401));
  }

  // const token = signToken(user._id);
  // res.status(200).json({ status: 'Success', token });

  createAndSendToken(user, 200, res);
});

//Protect method will recieve the JWT token in the header of the requestm, decodes the jwt token,
//get the user by id present in the decoded object, check if the jwt token is issued before the password is generated
exports.protect = catchSync(async (req, res, next) => {
  //1.Get the token and check if it is there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) token = req.cookies.jwt;
  if (!token) {
    return next(
      new ApiError(
        'You are not logged in!login with correct credentials and password',
        401
      )
    );
  }
  //2.Verfication token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  //3.check if user still exist
  const freshUser = await User.findById(decoded.id);
  if (!freshUser) {
    return next(
      new ApiError('The user belonging to the token does not exist', 401)
    );
  }
  //4.check if user password is changed after the token issue
  if (freshUser.createdPasswordAfter(decoded.iat)) {
    return next(
      new ApiError(
        'The user password is changed recently please login again',
        401
      )
    );
  }
  //grant access to the protected route
  req.user = freshUser;
  res.locals.user = freshUser;
  next();
});

//restrict to will allow the users you have rights to access the resources
exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError("You don't have permissions to perform this action", 403)
      );
    }
    next();
  };

//forgot password function will get the data from the database based on the user email id, it will generate the reset token
//save the reset token to the user document
//send the token to the user via email
exports.forgotPassword = catchSync(async (req, res, next) => {
  //Get the user data
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new ApiError('User not found'), 404);
  }
  //Generate random reset token
  const resetToken = user.generatePasswordResetToken();
  console.log(resetToken);
  await user.save({ validateBeforeSave: false });
  //send the token to the user via email
  const resetUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;
  const message = `click on this link ${resetUrl} to reset the password`;

  try {
    await new Email(user, resetUrl).sendPasswordResetToken();
    res.status(200).json({ status: 'success', message: 'Token sent to emial' });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new ApiError('There are an error in sending the email. Try again later'),
      500
    );
  }
});

//reset password function will get the patch request with the new password and token as the parameter
//encrypt the token
//get the user from the database based on the token
//update the user will the new password if user is obtained as a result in the third step

exports.resetPassword = catchSync(async (req, res, next) => {
  //get the user
  const hashedtoken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedtoken,
    passwordResetTokenExpires: { $gt: Date.now() },
  });

  //check if user is exist and then reset the password
  if (!user) return next(new ApiError('Token is invalid or expired'), 400);
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetTokenExpires = undefined;
  await user.save();

  //generate jwt token after reseting the password
  // const token = signToken(user._id);
  // res.status(201).json({ status: 'Success', token, data: { User: user } });
  createAndSendToken(user, 201, res);
});

//Update password
exports.updatePassword = catchSync(async (req, res, next) => {
  console.log(
    req.body.passwordCurrent,
    req.body.password,
    req.body.passwordConfirm
  );
  //Get the user from collection
  const user = await User.findById(req.user.id).select('+password');
  //Check if current password is posted
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password)))
    return next(new ApiError('Your password is wrong', 401));
  //if so update the password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  //log user in and send jwt
  // const token = signToken(user._id);
  // res.status(201).json({ status: 'Success', token, data: { User: user } });
  createAndSendToken(user, 201, res);
});

//check if the user is logged into the website or not
exports.isLoggedIn = async (req, res, next) => {
  //1.Get the token and check if it is there
  try {
    if (req.cookies.jwt) {
      //2.Verfication token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );
      //3.check if user still exist
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }
      //4.check if user password is changed after the token issue
      if (currentUser.createdPasswordAfter(decoded.iat)) {
        return next();
      }
      //user can be accesble in pug file
      res.locals.user = currentUser;
    }
    next();
  } catch (err) {
    return next();
  }
};

exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: 'success' });
};
