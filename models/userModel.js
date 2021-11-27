const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name'],
  },
  email: {
    type: String,
    required: [true, 'Please tell us your email'],
    unique: true,
    lowerCase: true,
    validate: [validator.isEmail, 'Please provide a valid Email'],
  },
  photo: {
    type: String,
    default: 'default.jpg',
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'Please provide a valid password'],
    minlenght: 8,
    select: false,
  },
  passwordChangedAt: {
    type: Date,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    minlenght: 8,
    validate: {
      //only works on save and create operation not on update
      validator: function (val) {
        return val === this.password;
      },
      message: 'Password and PasswordConfirm should match',
    },
  },
  passwordResetToken: String,
  passwordResetTokenExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

//pre hook middleware which runs before every create and save operation to the database
userSchema.pre('save', async function (next) {
  //checks if password is modified
  if (!this.isModified('password')) {
    return next();
  }
  //Encrypt the password
  this.password = await bcrypt.hash(this.password, 12);
  //delete the password confirm filed
  if (this.passwordConfirm) this.passwordConfirm = undefined;
  next();
});

// //to update the passwordChangedAt field when password is reset
userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

//Validate the password with the user logged in is correct or not
userSchema.methods.correctPassword = async function (candidiatePass, userPass) {
  // console.log(candidiatePass, userPass);
  return await bcrypt.compare(candidiatePass, userPass);
};

//chcek if the password is updated after the jwtToken is issued
userSchema.methods.createdPasswordAfter = function (JwtTimeStamp) {
  if (this.passwordChangedAt) {
    const timeStamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    console.log(timeStamp, JwtTimeStamp);
    return JwtTimeStamp < timeStamp;
  }

  return false; //password is not changed after token is issued
};

//Generate a random token which is sent to the user to reset the password

userSchema.methods.generatePasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.passwordResetTokenExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};
const User = mongoose.model('User', userSchema);
module.exports = User;
