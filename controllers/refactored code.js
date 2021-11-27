    //1.Filtering
    // let queryObj = { ...req.query };
    // const execludeFields = ['sort', 'limit', 'page', 'field'];
    // execludeFields.forEach((item) => delete queryObj[item]);

    // //2.Advance Filtering
    // let queryStr = JSON.stringify(queryObj);
    // queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    // queryObj = JSON.parse(queryStr);
    //Query Database
    // let query = Tour.find(queryObj);
    // //4.Sorting
    // if (req.query.sort) {
    //   const sortBy = req.query.sort.split(',').join(' ');
    //   query = query.sort(sortBy);
    // } else {
    //   query = query.sort('-createdAt');
    // }
    // //5.field omitting
    // if (req.query.field) {
    //   const fields = req.query.field.split(',').join(' ');
    //   query = query.select(fields);
    // } else {
    //   query = query.select('-__v');
    // }

    // //6.pagination
    // const page = req.query.page * 1 || 1;
    // const limit = req.query.limit * 1 || 100;
    // const skip = (page - 1) * limit;
    // console.log(page, limit, skip);
    // query = query.skip(skip).limit(limit);

    // if (req.query.page) {
    //   const numTours = await Tour.countDocuments();
    //   if (skip >= numTours) throw new Error('This page does not exist');
    // }