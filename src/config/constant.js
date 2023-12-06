require('dotenv').config();

const NODE_ENV = process.env.NODE_ENV 
const PORT = process.env.PORT 
const MONGODB_URI = process.env.MONGODB_URI 
const CLIENT_URL = process.env.CLIENT_URL
const JWT_SECRET = process.env.JWT_SECRET 
const JWT_SECRET_EXPIRATION = process.env.JWT_SECRET_EXPIRATION

module.exports = {
    NODE_ENV, 
    PORT, 
    MONGODB_URI, 
    CLIENT_URL,
    JWT_SECRET, 
    JWT_SECRET_EXPIRATION 
}