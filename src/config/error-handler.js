const mongoose = require('mongoose');
const { TokenExpiredError } = require('jsonwebtoken');
const httpStatus = require('http-status');
const logger = require('./logger');
const HttpException = require('../middlewares/http-exception');
const { NODE_ENV } = require('./constant');

const errorConverter = (err, _req, _res, next) => {
  let error = err;

  if (error instanceof TokenExpiredError) {
    // Handle TokenExpiredError
    const statusCode = httpStatus.UNAUTHORIZED;
    const message = 'Token expired';
    error = new HttpException(statusCode, message, false, err.stack);
  } else if (!(error instanceof HttpException)) {
    const statusCode =
      error.statusCode || error instanceof mongoose.Error
        ? httpStatus.BAD_REQUEST
        : httpStatus.INTERNAL_SERVER_ERROR;
    const message = error.message || `${httpStatus[statusCode]}`;
    error = new HttpException(statusCode, message, false, err.stack);
  }

  next(error);
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, _req, res, _next) => {
  let { statusCode, message } = err;

  if (NODE_ENV === 'production' && !err.isOperational) {
    statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    message = 'Internal server error';
  }

  res.locals['errorMessage'] = err.message;

  const response = {
    status: httpStatus[statusCode],
    message,
    payload: null,
  };

  if (NODE_ENV === 'development') logger.error(err);
  res.status(statusCode).send(response);
};

module.exports = {
  errorConverter,
  errorHandler,
};
