import express from "express";
import { getUserChats, getUserSingleChat } from "../controller/chatController.js"
import asyncHandler from "../middleware/errorHandler.js";
import verifyToken from "../middleware/verifyToken.js";
const router = express.Router()

//get chat users list
router.get("/chats/:userId", verifyToken, asyncHandler(getUserChats));
  
// Fetch messages between two users
router.get("/chat/:userId", verifyToken, asyncHandler(getUserSingleChat));


export default router