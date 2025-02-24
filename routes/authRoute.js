import express from "express"
import asyncHandler from "../middleware/errorHandler.js"
import verifyToken from "../middleware/verifyToken.js"
import validateUser from "../middleware/validateRequest.js"
import { registerUser, loginUser, logout, resetPassword, forgotPassword, getLoginedUser } from "../controller/authController.js";
import { registerUserSchema } from "../helpers/joiValidation.js";
const router = express.Router()


router.post("/register",  validateUser(registerUserSchema), asyncHandler(registerUser))
router.post("/login", asyncHandler(loginUser))
router.post("/logout", asyncHandler(logout))
router.post("/forgot-password" , asyncHandler(forgotPassword))
router.post("/reset-password" , asyncHandler(resetPassword))
router.get("/me" , verifyToken, asyncHandler(getLoginedUser))

export default router