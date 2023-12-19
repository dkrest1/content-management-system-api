const httpStatus = require("http-status");
const Joi = require("joi")

// Create category
const createCategorySchema = Joi.object({
    name: Joi.string().trim().min(4).max(30).required(),
    description: Joi.string().min(5).max(100),
});

const validateCreateCategoryDTO = (req, res, next) => {
    const { error } = createCategorySchema.validate(req.body);
    if (error) {
        return res.status(400).json({
            status: httpStatus.BAD_REQUEST,
            message: error.details[0].message,
            payload: null
        });
    }
    next();
};

// CategoryId
const categoryIdSchema = Joi.object({
    categoryId: Joi.string()
        .hex().length(24)
        .required()
        .messages({
            'any.required': 'Invalid category ID',
            'string.length': 'Invalid category ID',
            'string.base': 'Invalid category ID',
        }),
})

const validateCategoryId = (req, res, next) => {
    const { error } = categoryIdSchema.validate(req.params);
    if (error) {
        return res.status(400).json({
            status: httpStatus.BAD_REQUEST,
            message: error.details[0].message,
            payload: null
        });
    }
    next();
};

// Update Category
const updateCategorySchema = Joi.object({
    name: Joi.string().trim().min(4).max(30),
    description: Joi.string().min(5).max(100),
});

const validateUpdateCategoryDTO = (req, res, next) => {
    const { error } = updateCategorySchema.validate(req.body);
    if (error) {
        return res.status(400).json({
            status: httpStatus.BAD_REQUEST,
            message: error.details[0].message,
            payload: null
        });
    }
    next();
};

// Paginations

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
    validateCreateCategoryDTO,
    validateCategoryId,
    validateUpdateCategoryDTO,
    validatePagination
}