const express = require('express')
const auth = require("../middlewares/auth")
const {
    validateCategoryId,
    validateCreateCategoryDTO,
    validatePagination,
    validateUpdateCategoryDTO,
} = require("../validators/category.validator")

const router = express.Router()

const {
    createCategory,
    updateCategory,
    deleteCategory,
    findCategory,
    getCategory
} = require("../controllers/category.controller")

router.post("/", validateCreateCategoryDTO, auth("admin", "user"), createCategory);
router.patch("/:categoryId", validateCategoryId, validateUpdateCategoryDTO, auth("admin"), updateCategory);
router.get("/", validatePagination, auth("admin", "user"), getCategory);
router.get("/:categoryId", validateCategoryId, auth("admin", "user"), findCategory);
router.delete("/:categoryId", validateCategoryId, auth("user"), deleteCategory)

module.exports = router