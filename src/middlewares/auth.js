const httpStatus = require('http-status');
const HttpException = require('./http-exception');
const { JWT_SECRET } = require('../config/constant');
const UserModel = require('../models/user.model');
const logger = require('../config/logger');
const { validateToken } = require('../utils/helper.util');

const auth =
  (...args) =>
    async (req, res, next) => {
      let token;
      try {
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
          token = req.headers.authorization.split(' ')[1];
          const payload = await validateToken(token, JWT_SECRET);
          const user = await UserModel.findOne({ _id: payload.sub });
          if (!user) {
            throw new HttpException(httpStatus.UNAUTHORIZED, 'Unauthorized');
          }
          const role = payload.role;
          if (args.includes(role)) {
            req.user = user;
            next();
          } else {
            return res.status(403).json({
              status: httpStatus.FORBIDDEN,
              message: 'Access forbidden',
              payload: null,
            });
          }
        } else {
          return res.status(401).json({
            status: httpStatus.UNAUTHORIZED,
            message: 'Unauthorized: missing or invalid authorization header',
            payload: null,
          });
        }
      } catch (error) {
        logger.error(error);
        next(error);
      }
    };

module.exports = auth;
