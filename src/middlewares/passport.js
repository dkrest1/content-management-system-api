const LocalAuth = require('passport-local')
import bcrypt from 'bcrypt';
import UserModel from "../models/user.model";
import ApiError from "@/middlewares/api-error.types";
import httpStatus from "http-status";

const LocalStrategy = LocalAuth.Strategy;

module.exports =  function initialize(passport) {
  const authenticateUser = new LocalStrategy({
    usernameField: "email",
    passwordField: "password"
  }, async (email, password, done) => {
    try {
      const response = await UserModel.findOne({ email });
      if (!response)  {
        throw new ApiError(httpStatus.BAD_REQUEST, "invalid credentials")
      }
      const user = response;
      const compare = await bcrypt.compare(password, user.password);
      if (!compare) {
        throw new ApiError(httpStatus.BAD_REQUEST, "invalid credentials")
      }

      return done(null, user);
    }catch(err) {
      return done(err)
    }
  });
  passport.use('users', authenticateUser);
  passport.serializeUser((data, done) => done(null, data))
  passport.deserializeUser((data, done) => done(null, data))
}