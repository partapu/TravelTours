const express = require('express');

const tourControllers = require('../controllers/tourController');
const authController = require('../controllers/authController');
const reviewRouters = require('./reviewRoutes');

const router = express.Router();

router.use('/:tourId/reviews', reviewRouters);
router
  .route('/top-5-cheap')
  .get(tourControllers.aliasTopTours, tourControllers.getAllTours);
router.route('/tours-stats').get(tourControllers.getStats);
router
  .route('/month-tour/:year')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide', 'guide'),
    tourControllers.getMonthTours
  );
router
  .route('/')
  .get(tourControllers.getAllTours)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourControllers.createTour
  );

///tours-within/500/center/:-40,30/unit/mi
router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourControllers.getToursWithIn);

router
  .route('/distance/center/:latlng/unit/:unit')
  .get(tourControllers.getGeoDistance);

router
  .route('/:id')
  .get(tourControllers.getTour)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourControllers.uploadTourImages,
    tourControllers.resizeTourImages,
    tourControllers.updateTour
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourControllers.deleteTour
  );

// router
//   .route('/:tourId/reviews')
//   .post(
//     authController.protect,
//     authController.restrictTo('user'),
//     reviewController.createNewReview
//   );

module.exports = router;
