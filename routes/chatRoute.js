import express from "express";
import { getUnreadCounts, getUserChats, getUserSingleChat, markAsRead } from "../controller/chatController.js"
import asyncHandler from "../middleware/errorHandler.js";
import verifyToken from "../middleware/verifyToken.js";
const router = express.Router()

//get chat users list
router.get("/chats/:userId", verifyToken, asyncHandler(getUserChats));
router.get("/unread", verifyToken, asyncHandler(getUnreadCounts));
  
// Fetch messages between two users
router.get("/chat/:userId", verifyToken, asyncHandler(getUserSingleChat));
router.post("/mark-as-read", verifyToken, asyncHandler(markAsRead));


export default router