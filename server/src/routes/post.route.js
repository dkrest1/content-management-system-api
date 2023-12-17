const express = require('express')
const router = express.Router()

const {
    createPost,
    updatePost,
    deletePost,
    findPost,
    getPost
} = require("../controllers/post.controller")

router.post("/", createPost);
router.patch("/:postId", updatePost);
router.get("/", getPost);
router.get("/:postId", findPost);
router.delete("/:postId", deletePost)

module.exports = router