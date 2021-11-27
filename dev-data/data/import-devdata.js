const fs = require('fs');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const tourModel = require('../../models/tourModel');
const userModel = require('../../models/userModel');
const reviewModel = require('../../models/reviewModel');

dotenv.config({ path: '../../config.env' });

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => console.log('DB connection is sucessfull'))
  .catch((err) => console.log(err));

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8')
);

// const tours = obj1.map((tour) => {
//   delete tour.id;
//   return tour;
// });

// const users = obj2.map((user) => {
//   delete user.id;
//   return user;
// });
// const reviews = obj3.map((review) => {
//   delete review.id;
//   return review;
// });
//import data to the database
const importData = async function () {
  try {
    await tourModel.create(tours);
    await userModel.create(users, { validateBeforeSave: false });
    await reviewModel.create(reviews);
    console.log('All the documents are imported into database');
  } catch (err) {
    console.log(err.message);
  }
};

const deleteData = async function () {
  try {
    await tourModel.deleteMany({});
    await userModel.deleteMany({});
    await reviewModel.deleteMany({});
    console.log('All the documents are deleted from the database');
  } catch (err) {
    console.log(err.message);
  }
};
// deleteData().then(() => importData());
console.log(process.argv);
if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
