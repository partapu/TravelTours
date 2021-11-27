const express = require('express');
const path = require('path');
const morgan = require('morgan');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const rateLimit = require('express-rate-limit');
const csp = require('express-csp');

const cookieParser = require('cookie-parser');
const ApiError = require('./utilis/apierror');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const viewRoutes = require('./routes/viewRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const globalErrorHandler = require('./controllers/errorController');

const app = express();

//allowing access to static files
app.use(express.static(path.join(__dirname, 'public')));

//Tenplate Engine
app.set('view engine', 'pug');

//set the Path to all the views
app.set('views', path.join(__dirname, 'views'));
//Evironment
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
//Global middlewares

//set security http headers
app.use(helmet());

// app.use((req, res, next) => {
//   res.header(
//     'Access-Control-Allow-Headers',
//     'Orgin, X-Requested-With, Context-Type, Accept'
//   );
//   res.header('Access-Control-Allow-Origin: *');
//   res.header('Access-Control-Allow-Origin: *');
//   res.header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
//   res.header('Access-Control-Allow-Headers: *');
//   res.header('Access-Control-Max-Age: 1728000');
//   res.header('Content-Length: 0');
//   res.header('Content-Type: text/plain');
//   next();
// });

// app.use(
//   helmet.contentSecurityPolicy({
//     directives: {
//       connectSrc: ["'self'", `ws://localhost:3000/`],
//       defaultSrc: ["'self'", 'https:', 'http:', 'data:', 'ws:'],
//       baseUri: ["'self'"],
//       fontSrc: ["'self'", 'https:', 'http:', 'data:'],
//       scriptSrc: ["'self'", 'https:', 'http:', 'blob:'],
//       styleSrc: ["'self'", "'unsafe-inline'", 'https:', 'http:'],
//     },
//   })
// );

csp.extend(app, {
  policy: {
    directives: {
      'default-src': ['self'],
      'style-src': ['self', 'unsafe-inline', 'https:'],
      'font-src': ['self', 'https://fonts.gstatic.com'],
      'script-src': [
        'self',
        'unsafe-inline',
        'data',
        'blob',
        'https://js.stripe.com',
        'https://api.mapbox.com',
      ],
      'worker-src': [
        'self',
        'unsafe-inline',
        'data:',
        'blob:',
        'https://js.stripe.com',
        'https://api.mapbox.com',
      ],
      'frame-src': [
        'self',
        'unsafe-inline',
        'data:',
        'blob:',
        'https://js.stripe.com',
        'https://api.mapbox.com',
      ],
      'img-src': [
        'self',
        'unsafe-inline',
        'data:',
        'blob:',
        'https://js.stripe.com',
        'https://api.mapbox.com',
      ],
      'connect-src': [
        'self',
        'unsafe-inline',
        'data:',
        'blob:',
        'https://api.mapbox.com',
        'https://events.mapbox.com',
        'ws://localhost:3000',
      ],
    },
  },
});

// app.use(
//   helmet.contentSecurityPolicy({
//     directives: {
//       defaultSrc: ["'self'", 'data:', 'blob:'],
//       baseUri: ["'self'"],
//       fontSrc: ["'self'", 'https:', 'data:'],
//       scriptSrc: ["'self'", 'https://*.cloudflare.com'],
//       scriptSrc: ["'self'", 'https://*.stripe.com'],
//       scriptSrc: ["'self'", 'https://*.mapbox.com'],
//       frameSrc: ["'self'", 'https://*.stripe.com'],
//       objectSrc: ["'none'"],
//       styleSrc: ["'self'", 'https:', 'unsafe-inline'],
//       workerSrc: ["'self'", 'data:', 'blob:'],
//       childSrc: ["'self'", 'blob:'],
//       imgSrc: ["'self'", 'data:', 'blob:'],
//       connectSrc: ["'self'", 'blob:', 'https://*.mapbox.com'],
//       upgradeInsecureRequests: [],
//     },
//   })
// );

//rate limiting
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many request from this IP please try again in an hour',
});

app.use('/api', limiter);

//reading json data from the body to res.body
app.use(express.json({ limit: '10kb' }));
//Parsing form data
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
//Parse Cookies
app.use(cookieParser());

//Data sanitization against NoSql query injection
app.use(mongoSanitize());
//Data sanitization against xss
app.use(xss());

//parameter pollustioning
app.use(
  hpp({
    whitelist: [
      'duration',
      'price',
      'difficulty',
      'maxGroupSize',
      'maxGroupSize',
      'ratingQunatity',
      'ratingsAverage',
      'role',
    ],
  })
);

//adding request time
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.cookies);
  next();
});
// app.get('/api/v1/tours', getAllTours);
// app.get('/api/v1/tours/:id', getTour);
// app.post('/api/v1/tours', createTour);
// app.patch('/api/v1/tours/:id', updateTour);
// app.delete('/api/v1/tours/:id', deletTour);

//Route for rendering pug files

//Route
app.use('/', viewRoutes);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/bookings', bookingRoutes);
//handle routes that are not defined
app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 'fail',
  //   message: `can't find ${req.originalUrl} on the server`,
  // });
  next(new ApiError(`can't find ${req.originalUrl} on the server`, 404));
});

//global error handler middleware
app.use(globalErrorHandler);
//Server
module.exports = app;
