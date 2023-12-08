const express = require('express')
const {
    updateUser,
    findUser,
    getUser,
    deleteUser
} = require("../controllers/user.controller")

const router = express.Router()
router.patch("/:userId", updateUser);
router.get("/:userId", findUser);
router.get("/", getUser);
router.delete("/:userId", deleteUser)

module.exports = router