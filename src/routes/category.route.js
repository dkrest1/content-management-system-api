const express = require('express')

const router = express.Router()

const {
    createCategory,
    updateCategory,
    deleteCategory,
    findCategory,
    getCategory
} = require("../controllers/category.controller")

router.post("/", createCategory);
router.patch("/:postId", updateCategory);
router.get("/", getCategory);
router.get("/:postId", findCategory);
router.delete("/:postId", deleteCategory)

module.exports = router