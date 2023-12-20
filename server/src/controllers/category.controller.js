const httpStatus = require("http-status")
const HttpException = require("../middlewares/http-exception")
const CategoryModel = require("../models/category.model")
const asyncErrorHandler = require("../utils/async-error-handler.util")

const createCategory = asyncErrorHandler(async (req, res) => {
    const {name, description} = req.body
    const existedCategory = await CategoryModel.findOne({name: name.toLowerCase()})
    if(existedCategory) {
        throw new HttpException(httpStatus.BAD_REQUEST, "Category already exist")
    }
    
    const newCategory = new CategoryModel({
        name: name.toLowerCase(),
        description
    })

    await newCategory.save()

    return res.status(201).json({
        status: httpStatus.CREATED,
        message: "Created successfully",
        payload: {catagory: newCategory}
    })
})

const updateCategory = asyncErrorHandler(async (req, res) => {
    const {name, description} = req.body
    const categoryId = req.params.categoryId
    const category = await CategoryModel.findById(categoryId)
    if(!category) {
        throw new HttpException(httpStatus.NOT_FOUND, "Category not found")
    }

    if(name) {
        category.name = name.toLowerCase()
    }

    if(description) {
        category.description = description
    }

    await category.save()

    return res.status(200).json({
        status: httpStatus.OK,
        message: "Success",
        payload: { category }
    })
})

const findCategory = asyncErrorHandler(async (req, res) => {
    const categoryId = req.params.categoryId
    const category = await CategoryModel.findById(categoryId)
    if(!category) {
        throw new HttpException(httpStatus.NOT_FOUND, "Category not found")
    }

    return res.status(200).json({
        status: httpStatus.OK,
        message: "Success",
        payload: { category }
    })

})

const getCategory = asyncErrorHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10

    const queryOption ={
        page,
        limit,
    }

    const response = await CategoryModel.paginate({}, queryOption)

    return res.status(200).json({
        status: httpStatus.OK,
        message: "Success",
        payload: response
    })
})

const deleteCategory = asyncErrorHandler(async (req, res) => {
    const categoryId = req.params.categoryId
    const category = await CategoryModel.findOne({_id: categoryId})
    if(!category) {
        throw new HttpException(httpStatus.BAD_REQUEST, "category not found")
    }

    category.active = false
    await category.save()

    return res.status(200).json({
        status: httpStatus.OK,
        message: "Success",
        payload: null
    })
})



module.exports = {
    createCategory,
    updateCategory,
    findCategory,
    getCategory,
    deleteCategory
}