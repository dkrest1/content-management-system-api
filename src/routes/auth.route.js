const express = require('express')
const {
    validateLoginDTO,
    validateSignUpDTO
} = require("../validators/auth.validator")

const router = express.Router()

const {
    signUpUser,
    loginUser,
    forgetPassword,
    resetPassword
} = require("../controllers/auth.controller")

router.post("/signup", signUpUser);
router.post("/login", loginUser);
router.post("/password/forget", forgetPassword);
router.post("/password/reset", resetPassword);

module.exports = router