const httpStatus = require("http-status")
const HttpException = require("../middlewares/http-exception")
const UserModel = require("../models/user.model")
const asyncErrorHandler = require("../utils/async-error-handler.util")

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
    
})

const forgetPassword = asyncErrorHandler(async (req, res) => {
    
})

const resetPassword = asyncErrorHandler(async (req, res) => {
    
})


module.exports = {
    signUpUser,
    loginUser,
    forgetPassword,
    resetPassword
}