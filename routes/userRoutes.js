const express = require('express');
// const multer = require('multer');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

// const upload = multer({ dest: 'public/img/users' });

const router = express.Router();
router.post('/signup', authController.SignUp);
router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.post('/forgotPassword', authController.forgotPassword);
router.patch(
  '/updatePassword',
  authController.protect,
  authController.updatePassword
);
router.patch('/resetpassword/:token', authController.resetPassword);

//Protects all the routes after this middleware
router.use(authController.protect);

router.get(
  '/me',

  userController.getMe,
  userController.getUser
);
router.patch(
  '/updateMe',
  userController.uploadUserPhoto,
  userController.resizeUserImage,
  userController.updateMe
);
router.delete('/deleteMe', userController.deleteMe);

//only admins perfrom the actions after this middleware
router.use(authController.restrictTo('admin'));

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);
router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
