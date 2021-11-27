const dotenv = require('dotenv');
const mongoose = require('mongoose');
// const path = require('path');

process.on('uncaughtException', (err) => {
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: './config.env' });

const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

//Data base connection
const connectDB = async () => {
  await mongoose.connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  });
  console.log('DB connection is sucessfull');
};
connectDB();

const port = process.env.PORT || 3000;

//Running Server
const server = app.listen(port, () => {
  console.log(`App is running on port ${port}`);
});

//Unhandlelled Promise Rejections
process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
