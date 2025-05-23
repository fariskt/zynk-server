import Joi from "joi"


export const registerUserSchema = Joi.object({
    fullname: Joi.string().min(3).required().messages({
        "string.base": "fullname must be a string",
        "string.empty": "fullname is required",
        "string.min": "fullname must be atleast 3 characters long"
    }),
    email: Joi.string().email().required().messages({
        "string.empty": "Email is required",
        "string.email": "Email must be valid email address"
    }),
    password: Joi.string().min(6).max(50).required().messages({
        "string.empty": "Password is required",
        "string.min": "Password must be atleast 6 characters long",
        "string.max": "Password cannot exceed more than 50 characters long"
    }),
    confirmPassword: Joi.string().valid(Joi.ref("password")).required().messages({
        "any.only": "Password must match",
        "string.empty": "Confirm password is required"
    })
})
