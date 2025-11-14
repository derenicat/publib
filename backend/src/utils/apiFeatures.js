class APIFeatures {
  constructor(query, queryString) {
    this.query = query; // Mongoose query object (e.g., User.find())
    this.queryString = queryString; // Query string from Express (req.query)
  }

  filter() {
    // 1A) Basic Filtering: Create a shallow copy of the query string
    const queryObj = { ...this.queryString };

    // Exclude special keywords used for other features
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);

    // 1B) Advanced Filtering (for gte, gt, lte, lt)
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    // Build the query
    this.query = this.query.find(JSON.parse(queryStr));

    // Return the entire object to allow chaining
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      // Mongoose expects a space-separated string for sorting (e.g., 'price -ratingsAverage')
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      // Default sort by creation date if no sort is specified
      this.query = this.query.sort('-createdAt');
    }

    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      // Mongoose expects a space-separated string for field selection (e.g., 'name price description')
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      // Default: Exclude the '__v' field from Mongoose
      this.query = this.query.select('-__v');
    }

    return this;
  }

  paginate() {
    // Get page number, default to 1
    const page = this.queryString.page * 1 || 1;
    // Get limit, default to 100
    const limit = this.queryString.limit * 1 || 100;
    // Calculate documents to skip
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

export default APIFeatures;
