const httpStatus = require("http-status")
const UserModel = require("../models/user.model")
const asyncErrorHandler = require("../utils/async-error-handler.util")
const HttpException = require("../middlewares/http-exception")
const {compareHashedPassword, hashedPassword} = require("../utils/helper.util")

const updateUser = asyncErrorHandler(async (req, res) => {
    const {phone} = req.body
    const userId = req.user._id
    const user = await UserModel.findById(userId)
    if(phone) {
        user.phone = phone
    }
    await user.save()
    return res.status(200).json({
        status: httpStatus.OK,
        message: "Success",
        payload: {user}
    })
    
})

const findUser = asyncErrorHandler(async (req, res) => {
    const userId = req.user._id
    const user = await UserModel.findById(userId)
    return res.status(200).json({
        status: httpStatus.OK,
        message: "Success",
        payload: {user}
    })
})

const deleteUser = asyncErrorHandler(async (req, res) => {
    const userId = req.user._id
    await UserModel.deleteOne({_id: userId})
    return res.status(200).json({
        status: httpStatus.OK,
        message: "Profile deleted successfully",
        payload: null
    })
})

const updatePassword = asyncErrorHandler(async (req, res) => {
    const userId = req.user._id
    const user = await UserModel.findById(userId)
    const {old_password, new_password} = req.body
    const correctPassword = await compareHashedPassword(old_password, user.password)
    if(!correctPassword) {
        throw new HttpException(httpStatus.BAD_REQUEST, "Incorrect password")
    }

    const hashedPassword = await hashedPassword(new_password)

    user.password = hashedPassword
    await user.save()
    return res.status(200).json({
        status: httpStatus.OK,
        message: "Profile deleted successfully",
        payload: null
    })

})

module.exports = {
    updateUser,
    findUser,
    deleteUser,
    updatePassword
}