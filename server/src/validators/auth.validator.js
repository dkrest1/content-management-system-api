const httpStatus = require("http-status");
const Joi = require("joi")

// Signup
const signUpSchema = Joi.object({
    username: Joi.string()
        .min(3)
        .max(30)
        .required()
        .messages({
            'string.base': 'Username must be a string',
            'string.min': 'Username must be at least 3 characters long',
            'string.max': 'Username must be at most 30 characters long',
            'any.required': 'Username is required',
          }),
    email: Joi.string()
        .email()
        .required()
        .messages({
            'string.base': 'Email must be a string',
            'string.email': 'Please enter a valid email address',
            'any.required': 'Email is required',
        }),
    password: Joi.string().min(8).required().messages({
        'string.base': 'Password must be a string',
        'string.min': 'Password must be at least 8 characters long',
        'any.required': 'Password is required',
      }) 
})

const validateSignUpDTO= (req, res, next) => {
    const { error } = signUpSchema.validate(req.body);
    if (error) {
        return res.status(400).json({
            status: httpStatus.BAD_REQUEST,
            message: error.details[0].message,
            payload: null
        });
    }
    next();
};

// Login
const loginSchema = Joi.object({
    email: Joi.string()
        .email()
        .required()
        .messages({
            'string.base': 'Email must be a string',
            'string.email': 'Please enter a valid email address',
            'any.required': 'Email is required',
        }),
    password: Joi.string().min(8).required().messages({
        'string.base': 'Password must be a string',
        'string.min': 'Password must be at least 8 characters long',
        'any.required': 'Password is required',
      }) 
})

const validateLoginDTO = (req, res, next) => {
    const { error } = loginSchema.validate(req.body);
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
    validateSignUpDTO,
    validateLoginDTO
}