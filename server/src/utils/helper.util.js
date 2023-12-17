const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const hashedPassword = async (password) => {
    const saltRounds = 10
    const hashedPassword = await bcrypt.hash(password, saltRounds)
    return hashedPassword
}

const compareHashedPassword = async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword)
}

const generateToken = (payload, secret, expires) => {
    const token = jwt.sign(payload, secret, {expiresIn: expires})
    return token;

}

const validateToken = async (token, secret) => {
    const payload = jwt.verify(token, secret)
    return payload;
}

module.exports = {
    hashedPassword,
    compareHashedPassword,
    generateToken,
    validateToken
}