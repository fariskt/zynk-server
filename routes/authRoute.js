const express = require('express');
const asyncHandler = require('../middleware/errorHandler');
const validateUser = require('../middleware/validateRequest');
const { registerUser, loginUser, logout, resetPassword, forgotPassword, getLoginedUser } = require('../controller/authController');
const { registerUserSchema } = require('../helpers/joiValidation');
const router = express.Router()
const verifyToken = require('../middleware/verifyToken');


router.post("/register",  validateUser(registerUserSchema), asyncHandler(registerUser))
router.post("/login", asyncHandler(loginUser))
router.post("/logout", asyncHandler(logout))
router.post("/forgot-password" , asyncHandler(forgotPassword))
router.post("/reset-password" , asyncHandler(resetPassword))
router.get("/me" , verifyToken, asyncHandler(getLoginedUser))

module.exports = router