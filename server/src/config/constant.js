require('dotenv').config();

const NODE_ENV = process.env.NODE_ENV;
const PORT = process.env.PORT;
const MONGODB_URI = process.env.MONGODB_URI;
const CLIENT_URL = process.env.CLIENT_URL;
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_SECRET_EXPIRATION = process.env.JWT_SECRET_EXPIRATION;
const JWT_RESET_SECRET = process.env.JWT_RESET_SECRET;
const JWT_RESET_SECRET_EXPIRATION = process.env.JWT_RESET_SECRET_EXPIRATION;
const SMTP_USERNAME = process.env.SMTP_USERNAME;
const SMTP_PASSWORD = process.env.SMTP_PASSWORD;
const APP_URL = process.env.APP_URL;

module.exports = {
  NODE_ENV,
  PORT,
  MONGODB_URI,
  CLIENT_URL,
  JWT_SECRET,
  JWT_SECRET_EXPIRATION,
  JWT_RESET_SECRET,
  JWT_RESET_SECRET_EXPIRATION,
  SMTP_USERNAME,
  SMTP_PASSWORD,
  APP_URL,
};
