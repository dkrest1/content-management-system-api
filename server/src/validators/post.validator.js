const httpStatus = require("http-status");
const Joi = require("joi")

// Create Post
const createPostSchema = Joi.object({
    category: Joi.string().trim().min(4).max(30).required(),
    title: Joi.string().trim().min(5).max(100).required(), 
    body: Joi.string().min(10).max(280).required(), 
})

const validateCreatePostDTO = (req, res, next) => {
    const { error } = createPostSchema.validate(req.body);
    if (error) {
        return res.status(400).json({
            status: httpStatus.BAD_REQUEST,
            message: error.details[0].message,
            payload: null
        });
    }
    next();
};

// PostId
const postIdSchema = Joi.object({
    postId: Joi.string()
        .hex().length(24)
        .required()
        .messages({
            'any.required': 'Invalid post ID',
            'string.length': 'Invalid post ID',
            'string.base': 'Invalid post ID',
        }),
})

const validatePostId = (req, res, next) => {
    const { error } = postIdSchema.validate(req.params);
    if (error) {
        return res.status(400).json({
            status: httpStatus.BAD_REQUEST,
            message: error.details[0].message,
            payload: null
        });
    }
    next();
};

// Update Post
const updatePostSchema = Joi.object({
    category: Joi.string().trim().min(4).max(30),
    title: Joi.string().trim().min(5).max(100), 
    body: Joi.string().min(10).max(280), 
})

const validateUpdatePostDTO = (req, res, next) => {
    const { error } = updatePostSchema.validate(req.body);
    if (error) {
        return res.status(400).json({
            status: httpStatus.BAD_REQUEST,
            message: error.details[0].message,
            payload: null
        });
    }
    next();
};

// Pagination
const paginationSchema = Joi.object({
    page: Joi.number()
        .integer()
        .min(1)
        .message('Page must be a positive integer'),
    limit: Joi.number()
        .integer()
        .min(1)
        .max(100)
        .message('Limit must be a positive integer between 1 and 100'),
});

const validatePagination = (req, res, next) => {
    const { error } = paginationSchema.validate(req.query);

    if (error) {
        return res.status(400).json({
            status: httpStatus.BAD_REQUEST,
            message: error.details[0].message,
            payload: null
        });
    }

    next();
};


module.exports = {
    validateCreatePostDTO,
    validatePostId,
    validateUpdatePostDTO,
    validatePagination
}