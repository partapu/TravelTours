const ApiError = require('../utilis/apierror');
//Global Error handler
const sendErrorProd = function (err, res, req) {
  //API

  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational) {
      console.log('Operational Error');
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    //programming or unknow error we don't want to leak details to the client
    console.error('Error 🍗', err);
    return res.status(500).json({
      status: 'Error',
      message: 'Something went wrong',
    });
  }
  //Render
  if (err.isOperational) {
    console.log('Operational Error');
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong',
      msg: `${err.message}`,
    });
  }
  //programming or unknow error we don't want to leak details to the client
  console.error('Error 🍗', err);
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong',
    msg: `Please Try Agian after some time`,
  });
};
const sendErrorDev = function (err, res, req) {
  //API
  if (req.originalUrl.startsWith('/api')) {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }
  //Render
  else
    res.status(err.statusCode).render('error', {
      title: 'Something went wrong',
      msg: `${err.message}`,
    });
};

const handleCastErrorDB = function () {
  const message = `invalid ${err.path}:${err.value}`;
  const err1 = new ApiError(message, 400);
  return err1;
};
const handleDuplicateErrorDB = function () {
  const err1 = new ApiError(
    'Duplicate tour name: please use another value',
    400
  );
  return err1;
};
const handleValidationErrorDB = function () {
  const err1 = new ApiError(`Data validation failed`, 400);
  return err1;
};
const handleJWTError = function () {
  const err1 = new ApiError('Invalid token please login again', 401);
  return err1;
};
const handleTokenExpireError = function () {
  const err1 = new ApiError('token expired please login again', 401);
  return err1;
};
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;

  err.status = err.status || 'Error';
  console.log('Global Error handler middleware function');
  console.log(process.env.NODE_ENV);
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res, req);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;
    if (err.name === 'CastError') {
      error = handleCastErrorDB(error);
    } else if (err.code === 11000) {
      error = handleDuplicateErrorDB(error);
    } else if (err._message === 'Validation failed') {
      error = handleValidationErrorDB(error);
    } else if (err.name === 'JsonWebTokenError') {
      error = handleJWTError(error);
    } else if (err.name === 'TokenExpiredError')
      error = handleTokenExpireError(error);
    console.log(error);
    sendErrorProd(error, res, req);
  }
};
