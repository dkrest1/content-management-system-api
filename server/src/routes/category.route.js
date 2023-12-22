const express = require('express');
const auth = require('../middlewares/auth');
const {
  validateCategoryId,
  validateCreateCategoryDTO,
  validatePagination,
  validateUpdateCategoryDTO,
} = require('../validators/category.validator');

const router = express.Router();

const {
  createCategory,
  updateCategory,
  deleteCategory,
  findCategory,
  getCategory,
} = require('../controllers/category.controller');

router.post('/', validateCreateCategoryDTO, auth('admin', 'user'), createCategory);
router.patch(
  '/:categoryId',
  validateCategoryId,
  validateUpdateCategoryDTO,
  auth('admin'),
  updateCategory
);
router.get('/', validatePagination, getCategory);
router.get('/:categoryId', validateCategoryId, findCategory);
router.delete('/:categoryId', validateCategoryId, auth('admin'), deleteCategory);

module.exports = router;
