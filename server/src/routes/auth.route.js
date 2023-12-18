const express = require('express')
const passport = require("passport")
const {
    validateLoginDTO,
    validateSignUpDTO,
    validateForgetPasswordDTO,
    validateResetPasswordDTO
} = require("../validators/auth.validator")


const router = express.Router()

const {
    signUpUser,
    loginUser,
    forgetPassword,
    resetPassword
} = require("../controllers/auth.controller")

router.post("/signup", validateSignUpDTO,  signUpUser);
router.post("/login", validateLoginDTO, passport.authenticate("users", {session: false}), loginUser);
router.post("/password/forget", validateForgetPasswordDTO, forgetPassword);
router.post("/password/reset", validateResetPasswordDTO, resetPassword);

module.exports = router