import express from 'express';

const catchAsync = (fn: Function) => {
  return (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    fn(req, res, next).catch(next);
  };
};
export = catchAsync;
