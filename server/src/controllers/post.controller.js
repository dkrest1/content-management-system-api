const httpStatus = require("http-status")
const PostModel = require("../models/post.model")
const asyncErrorHandler = require("../utils/async-error-handler.util")
const CategoryModel = require("../models/category.model")
const UserModel = require("../models/user.model")
const HttpException = require("../middlewares/http-exception")

const createPost =  asyncErrorHandler(async (req, res) => {
    const userId = req.user._id
    const user = await UserModel.findById(userId)
    const {category, title, body} = req.body

    let existedCategory = await CategoryModel.findOne({name: category.toLowerCase()})

    if (!existedCategory) {
        existedCategory = new CategoryModel({name: category})
        await existedCategory.save()
    }

    const newPost = new PostModel({
        user,
        category: existedCategory,
        title,
        body
    })

    await newPost.save()

    return res.status(201).json({
        status: httpStatus.CREATED,
        message: "Post created successfully",
        payload: {
            post: newPost
        }
    })
})

const updatePost =  asyncErrorHandler(async (req, res) => {
    const {title, category, body} = req.body
    const userId = req.user._id
    const user = await UserModel.findById(userId)
    const postId = req.params.postId
    const post = await PostModel.findOne({user, _id: postId})
    if(!post) {
        throw new HttpException(httpStatus.BAD_REQUEST, "post not found")
    }

    if(title) {
        post.title = title
    }

    if(body) {
        post.body = body
    }

    if(category) {
        let existedCategory = await CategoryModel.findOne({name: category.toLowerCase()})
        if (!existedCategory) {
            existedCategory = new CategoryModel({name: category})
            await existedCategory.save()
        }

        post.category = existedCategory
    }

    await post.save()

    return res.status(200).json({
        status: httpStatus.OK,
        message: "Post updated successfully",
        payload: { post }
    })


})

const findPost =  asyncErrorHandler(async (req, res) => {
    const postId = req.params.postId
    const post = await PostModel.findById(postId)
    if(!post) {
        throw new HttpException(httpStatus.BAD_REQUEST, "post not found")
    }

    return res.status(200).json({
        status: httpStatus.OK,
        message: "Success",
        payload: { post }
    })

})

const getPost =  asyncErrorHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10

    const queryOption ={
        page,
        limit,
        populate: [
            {path: "user"},
            {path: "category"}
        ]
    }

    const response = await PostModel.paginate({}, queryOption)

    return res.status(200).json({
        status: httpStatus.OK,
        message: "Success",
        payload: response
    })
})

const deletePost =  asyncErrorHandler(async (req, res) => {
    const postId = req.params.postId
    const userId = req.user._id
    const user = await UserModel.findById(userId)
    const post = await PostModel.findOne({user, _id: postId})
    if(!post) {
        throw new HttpException(httpStatus.BAD_REQUEST, "post not found")
    }

    await PostModel.deleteOne({_id: postId})

    return res.status(200).json({
        status: httpStatus.OK,
        message: "Post deleted successfully",
        payload: null
    })
})

module.exports = {
    createPost,
    updatePost,
    findPost,
    getPost,
    deletePost
}