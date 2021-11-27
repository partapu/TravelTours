const express = require('express');
const bookingControllers = require('../controllers/bookingController');
const authController = require('../controllers/authController');

const router = express.Router();

router.get(
  '/checkout-session/:tourID',
  authController.protect,
  bookingControllers.getCheckoutSession
);

module.exports = router;
