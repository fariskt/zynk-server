import express from "express"
const router = express.Router()
import { getCommentByPostId, commentOnPost, replayToComment, getCommentReplies } from "../controller/commentController.js"
import asyncHandler from "../middleware/errorHandler.js";
import verifyToken from "../middleware/verifyToken.js";

// router.get("/comments", asyncHandler(getAllComments));
router.post("/:userId", verifyToken, asyncHandler(commentOnPost));
router.get("/:postId", asyncHandler(getCommentByPostId));
router.get("/replies/:commentId", verifyToken, asyncHandler(getCommentReplies))
router.post("/replay/:commentId", verifyToken, asyncHandler(replayToComment))


export default router;    