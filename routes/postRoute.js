import express from "express";
import {  createPost, getPosts, updatePostLike, getUserPostById, getPostById ,updatePost, deletePostByUser } from "../controller/postController.js";
import verifyToken from "../middleware/verifyToken.js";
import postUpload from "../middleware/postUpload.js"
import asyncHandler from "../middleware/errorHandler.js";
const router = express.Router()


router.post("/create-post", verifyToken,  postUpload.single("image") ,asyncHandler(createPost))
router.get("/posts" , asyncHandler(getPosts))
router.get("/:postId" ,asyncHandler(getPostById)) // single post
router.get("/user/:userId" , verifyToken , asyncHandler(getUserPostById)) //user post
router.patch("/like/:userId", verifyToken, asyncHandler(updatePostLike));
router.put("/update/:postId", verifyToken, asyncHandler(updatePost));
router.patch("/delete/:postId", verifyToken, asyncHandler(deletePostByUser))

export default router;    