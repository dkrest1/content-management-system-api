const httpStatus = require("http-status")
const HttpException = require("../middlewares/http-exception")
const bcrypt = require("bcrypt")
const UserModel = require("../models/user.model")
const asyncErrorHandler = require("../utils/async-error-handler.util")
const { generateToken, validateToken, hashedPassword } = require("../utils/helper.util")
const { 
    JWT_SECRET, 
    JWT_RESET_SECRET, 
    JWT_SECRET_EXPIRATION, 
    JWT_RESET_SECRET_EXPIRATION, 
    APP_URL
} = require("../config/constant")
const sendMail = require("../config/email")

const signUpUser = asyncErrorHandler(async (req, res) => {
    const {username, email, password} = req.body
    const existingUser = await UserModel.findOne({email})
    const existingUsername = await UserModel.findOne({username})
    if(existingUser) {
        throw new HttpException(httpStatus.BAD_REQUEST, "User with email existed")
    }

    if(existingUsername) {
        throw new HttpException(httpStatus.BAD_REQUEST, "User with username existed")
    }

    const user = new UserModel({
        username,
        email,
        password
    })

    await user.save()

    return res.status(201).json({
        status: httpStatus.CREATED,
        message: "Created",
        payload: user
    })

})

const loginUser = asyncErrorHandler(async (req, res) => {
    const user = req.user
    const payload = {
        sub: req.user._id,
        email: user.email,
        role: user.userRole
    }

    const token = generateToken(payload, JWT_SECRET, JWT_SECRET_EXPIRATION)

    return res.status(200).json({
        status: httpStatus.OK,
        message: "Success",
        payload: {
            user,
            access_token: token
        }
    })
})

const forgetPassword = asyncErrorHandler(async (req, res) => {
    const {email} = req.body
    const user = await UserModel.findOne({email})
    if(!user) {
        throw new HttpException(httpStatus.NOT_FOUND, "user not found")
    }

    const payload = {
        sub: user._id,
        email: user.email,
    }

    const reset_token = generateToken(payload, JWT_RESET_SECRET, JWT_RESET_SECRET_EXPIRATION)

    const params = {
        to: user.email,
        subject: "Password Reset",
        html: `
            <p>
                Click the link to reset your password: 
                <a href="${APP_URL}/api/v1/auth/password/reset?reset_token=${reset_token}">Reset Password</a>
            </p>`
    }

    // Send the email to the user
    const emailResponse = await sendMail(params)

    if(!emailResponse) {
        return res.status(500).json({
            status: httpStatus.INTERNAL_SERVER_ERROR,
            message: "Failed to send the email. Please try again later.",
            payload: null
        })
    } 

    return res.status(200).json({
        status: httpStatus.OK,
        message: "Email sent successfully",
        payload: null
    })
})

const resetPassword = asyncErrorHandler(async (req, res) => {
    const resetToken = req.query.reset_token
    const newPassword = req.body.new_password

    const payload = await validateToken(resetToken, JWT_RESET_SECRET)
    const user = await UserModel.findById(payload.sub)

    if(!user) {
        throw new HttpException(httpStatus.BAD_REQUEST, "User not found")
    }

    user.password = await hashedPassword(newPassword)
    await user.save()

    return res.status(200).json({
        status: httpStatus.OK,
        message: "Password updated successfully",
        payload: null
    })
})


module.exports = {
    signUpUser,
    loginUser,
    forgetPassword,
    resetPassword
}