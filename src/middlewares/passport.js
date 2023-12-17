const LocalAuth = require('passport-local');
const bcrypt = require("bcrypt");
const UserModel = require("../models/user.model")
const HttpException = require("./http-exception");
const httpStatus = require('http-status');

const LocalStrategy = LocalAuth.Strategy;

module.exports =  function initialize(passport) {
  const authenticateUser = new LocalStrategy({
    usernameField: "email",
    passwordField: "password"
  }, async (email, password, done) => {
    try {
      const response = await UserModel.findOne({ email });
      if (!response)  {
        throw new HttpException(httpStatus.BAD_REQUEST, "Invalid credentials")
      }
      const user = response;
      const compare = await bcrypt.compare(password, user.password);
      if (!compare) {
        throw new HttpException(httpStatus.BAD_REQUEST, "Invalid credentials")
      }

      return done(null, user);
    }catch(err) {
      return done(err)
    }
  });
  passport.use('users', authenticateUser);
  // passport.serializeUser((data, done) => done(null, data))
  // passport.deserializeUser((data, done) => done(null, data))
}