const express = require('express')
const auth = require("../middlewares/auth")
const {
    validateUpdateUserDTO
} = require("../validators/user.validator")
const {
    updateUser,
    findUser,
    deleteUser,
    updatePassword,
} = require("../controllers/user.controller")

const router = express.Router()

router.get("/me", auth("admin", "user"), findUser)
router.patch("/me", validateUpdateUserDTO, auth("admin", "user"), updateUser);
router.patch("/me/password", auth("admin", "user"), updatePassword);
router.delete("/me", auth("admin", "user"), deleteUser)

module.exports = router