const mongoose = require('mongoose');
const slugify = require('slugify');
// const validator = require('validator');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have name'],
      unique: true,
      trim: true,
      maxlength: [40, 'A tour must have less than or equal to 40 characters'],
      minlength: [10, 'A tour must have more than or equal to 10 characters'],
      // validate: {
      //   validator: validator.isAlpha,
      //   message: 'Tour name should only contain characters',
      // },
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have duration'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either easy, medium, hard',
      },
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have maxGroupSize'],
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
    },
    ratingQunatity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          //this variable points to the current document
          //this keyword only points to the current document on new doc creation not on update document
          return val < this.price;
        },
        message: 'priceDiscount value should be less tha price value',
      },
    },

    startLocation: {
      //GEOJSON Object
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number, //day of the tour the people will go to this location
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId, //Value is of type mongo Db ID
        ref: 'User', //Linking user model
      },
    ],
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have summary'],
    },
    secretTour: {
      type: Boolean,
      default: false,
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have imageCover'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
  },
  {
    toJSON: { virtuals: true },

    toObject: { virtuals: true },
  }
);
//setting Virtual filed will be returned on get request of the tour route
tourSchema.virtual('durationInWeeks').get(function () {
  return this.duration / 7;
});

//virtual populate
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour', //'tour is a feild in review model'
  localField: '_id', //id is tour id in tour modle
});

//Document middleware
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});
tourSchema.pre('create', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});
// tourSchema.post('save',function(doc,next)
// {
// console.log(doc);
// next();
// })

//Query middleware

tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

//Populate the user data Torurs->Users relatioship
tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt',
  });
  next();
});

// //Embedding uses in tour
// tourSchema.pre('save', async function (next) {
//   const guidesPromise = this.guides.map(async (id) => await User.findById(id));
//   this.guides = await Promise.all(guidesPromise);
//   next();
// });

//Aggregate middleware
// tourSchema.pre('aggregate', function (next) {
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
//   console.log(this.pipeline());
//   next();
// });

tourSchema.post(/^find/, function (docs, next) {
  console.log(
    `Time taken to run the query is ${Date.now() - this.start} milliseconds`
  );
  next();
});

// tourSchema.index({ price: 1 });
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });
const Tour = mongoose.model('Tour', tourSchema);
// const testTour = new Tour({ name: 'Hyd', rating: 4.6, price: 500 });

// testTour
//   .save()
//   .then((doc) =>
//     console.log(`${doc}
//       testTour data is saved to the database`)
//   )
//   .catch((err) => console.log(err.message));

module.exports = Tour;
