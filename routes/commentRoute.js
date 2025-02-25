import express from "express"
const router = express.Router()
import { getCommentByPostId, commentOnPost, replayToComment, getCommentReplies, toggleLikeUnlikeComment } from "../controller/commentController.js"
import asyncHandler from "../middleware/errorHandler.js";
import verifyToken from "../middleware/verifyToken.js";

router.post("/:userId", verifyToken, asyncHandler(commentOnPost));
router.get("/:postId", asyncHandler(getCommentByPostId));
router.get("/replies/:commentId", verifyToken, asyncHandler(getCommentReplies))
router.post("/reply/:commentId", verifyToken, asyncHandler(replayToComment))
router.put("/like/:commentId", verifyToken, asyncHandler(toggleLikeUnlikeComment))


export default router;    