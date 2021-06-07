"use strict";
class APIFeatures {
    constructor(query, queryParams) {
        this.query = query;
        this.queryParams = queryParams;
    }
    filter() {
        let queryObj = { ...this.queryParams };
        const toBeExcluded = ['fields', 'sortBy', 'page', 'limit'];
        Object.keys(queryObj).map(key => {
            if (toBeExcluded.includes(key))
                delete queryObj[key];
        });
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
        queryObj = JSON.parse(queryStr);
        this.query = this.query.find(queryObj);
        return this;
    }
    limitFields() {
        if (this.queryParams.fields) {
            const fields = this.queryParams.fields
                .split(',')
                .join(' ');
            this.query = this.query.select(fields);
        }
        return this;
    }
    sort() {
        if (this.queryParams.sortBy) {
            const sortBy = this.queryParams.sortBy
                .split(',')
                .join(' ');
            this.query = this.query.sort(sortBy);
        }
        return this;
    }
    paginationAndLimitation() {
        const pageNo = (Number(this.queryParams.page) || 1) - 1;
        const limit = Number(this.queryParams.limit) || 10;
        this.query = this.query.limit(limit).skip(pageNo * limit);
        return this;
    }
}
module.exports = APIFeatures;
