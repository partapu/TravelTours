const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review cannot be empty'],
      minlength: 3,
      maxlenght: 100,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, 'rating cannot be empty'],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      required: [true, 'Review must belong to a tour'],
      ref: 'Tour',
    },
    user: {
      type: mongoose.Schema.ObjectId,
      required: [true, 'Review must belong to a user'],
      ref: 'User',
    },
  },
  {
    toJSON: { virtuals: true },

    toObject: { virtuals: true },
  }
);

//This unique index will ensure that user can only give one review for a specific tour
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, function (next) {
  //   this.populate({
  //     path: 'user',
  //     select: 'name',
  //   }).populate({
  //     path: 'tour',
  //     select: 'name photo',
  //   });

  this.populate({
    path: 'user',
    select: 'name photo',
  });

  next();
});

reviewSchema.statics.calculateAverageRatings = async function (tourId) {
  const stats = await this.aggregate([
    { $match: { tour: tourId } },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage: stats[0].avgRating,
      ratingQunatity: stats[0].nRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage: 4.5,
      ratingQunatity: 0,
    });
  }
};

reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.findOne(); //will get the current review, which is stored in this object
  console.log(this.r);
  next();
});

//After the review document is updated or deleted
reviewSchema.post(/^findOneAnd/, function (next) {
  //await this.findOne() is not possible to write here,as query already finished execution
  this.r.constructor.calculateAverageRatings(this.r.tour);
});

reviewSchema.post('save', function () {
  this.constructor.calculateAverageRatings(this.tour);
});
const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
