const Joi = require("joi");

// Update user
const updateUserSchema = Joi.object({
    phone: Joi.string()
        .trim()
        .regex(/^\d{11}$/) 
        .message('Invalid phone number. Must be an 11-digit number without spaces.')
})

const validateUpdateUserDTO= (req, res, next) => {
    const { error } = updateUserSchema.validate(req.body);
    if (error) {
        return res.status(400).json({
            status: httpStatus.BAD_REQUEST,
            message: error.details[0].message,
            payload: null
        });
    }
    next();
};

//Update password
const updateUserPasswordSchema = Joi.object({
    old_password: Joi.string()
        .min(8)
        .required()
        .messages({
            'string.base': 'new_password must be a string',
            'string.min': 'old_password must be at least 8 characters long',
            'any.required': 'old_password is required',
        }),
    new_password: Joi.string()
        .min(8)
        .required()
        .messages({
            'string.base': 'new_password must be a string',
            'string.min': 'new_password must be at least 8 characters long',
            'any.required': 'new_password is required',
        }) 
})

const validateUpdateUserPasswordDTO = (req, res, next) => {
    const { error } = updateUserPasswordSchema.validate(req.body);
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
    validateUpdateUserDTO,
    validateUpdateUserPasswordDTO
}

