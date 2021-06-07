import { Query } from 'express-serve-static-core';
import { Document, DocumentQuery } from 'mongoose';

class APIFeatures<T extends Document> {
  public query: DocumentQuery<T[], T>;
  public queryParams: Query;
  // query -> Model.find()
  // queryParams -> req.query

  constructor(query: DocumentQuery<T[], T>, queryParams: Query) {
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
      const fields = (this.queryParams as { fields: string }).fields
        .split(',')
        .join(' ');
      this.query = this.query.select(fields);
    }
    return this;
  }

  sort() {
    if (this.queryParams.sortBy) {
      const sortBy = (this.queryParams as { sortBy: string }).sortBy
        .split(',')
        .join(' ');
      this.query = this.query.sort(sortBy);
    }
    return this;
  }

  paginationAndLimitation() {
    const pageNo =
      (Number((this.queryParams as { page: string }).page) || 1) - 1;
    const limit = Number((this.queryParams as { limit: string }).limit) || 10;
    this.query = this.query.limit(limit).skip(pageNo * limit);
    return this;
  }
}

export = APIFeatures;
