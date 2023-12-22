const express = require('express');
const auth = require('../middlewares/auth');
const {
  validateCreatePostDTO,
  validatePostId,
  validateUpdatePostDTO,
  validatePagination,
} = require('../validators/post.validator');

const router = express.Router();

const {
  createPost,
  updatePost,
  deletePost,
  findPost,
  getPost,
} = require('../controllers/post.controller');

router.get('/', validatePagination, getPost);
router.post('/', validateCreatePostDTO, auth('user', 'admin'), createPost);
router.get('/:postId', validatePostId, findPost);
router.patch('/:postId', validatePostId, validateUpdatePostDTO, auth('admin', 'user'), updatePost);
router.delete('/:postId', validatePostId, auth('user', 'admin'), deletePost);

module.exports = router;
