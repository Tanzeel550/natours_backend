class APIFeatures {
	public query: any;
	public queryParams: any;
  // query -> Model.find()
  // queryParams -> req.query

  constructor(query, queryParams) {
    this.query = query;
    this.queryParams = queryParams;
  }

  filter() {
    let queryObj = { ...this.queryParams };
    const toBeExcluded = ['fields', 'sortBy', 'page', 'limit'];

    Object.keys(queryObj).map(key => {
      if (toBeExcluded.includes(key)) delete queryObj[key];
    });

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
    queryObj = JSON.parse(queryStr);

    this.query = this.query.find(queryObj);

    return this;
  }

  limitFields() {
    if (this.queryParams.fields) {
      const fields = this.queryParams.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    }
    return this;
  }

  sort() {
    if (this.queryParams.sortBy) {
      const sortBy = this.queryParams.sortBy.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    }
    return this;
  }

  paginationAndLimitation() {
    const pageNo = this.queryParams.page * 1 - 1 || 1;
    const limit = this.queryParams.limit * 1 || 100;
    this.query = this.query.limit(limit).skip(pageNo * this.queryParams.limit);
    return this;
  }
}

module.exports = APIFeatures;
