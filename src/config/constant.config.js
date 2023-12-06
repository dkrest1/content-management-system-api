require('dotenv').config();

const NODE_ENV = process.env.NODE_ENV 
const PORT = process.env.PORT 
const MONGO_DB_URI = process.env.MONGO_DB_URI 
const CLIENT_URL = process.env.CLIENT_URL
const JWT_SECRET = process.env.JWT_SECRET 
const JWT_SECRET_EXPIRATION = process.env.JWT_SECRET_EXPIRATION

module.exports = {
    NODE_ENV, 
    PORT, 
    MONGO_DB_URI, 
    CLIENT_URL,
    JWT_SECRET, 
    JWT_SECRET_EXPIRATION 
}