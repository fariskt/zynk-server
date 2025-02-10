const express = require("express")
const asyncHandler = require("../middleware/errorHandler")
const {  createPost, getPosts, updatePostLike, commentOnPost, getUserPostById, getPostById } = require("../controller/postController")
const router = express.Router()
const verifyToken = require("../middleware/verifyToken")
const postUpload = require("../middleware/postUpload")

router.post("/create-post", verifyToken,  postUpload.single("image") ,asyncHandler(createPost))
router.get("/posts" , asyncHandler(getPosts))
router.get("/:postId" ,asyncHandler(getPostById)) // single post
router.get("/user/:userId" ,asyncHandler(getUserPostById)) //user post
router.patch("/like/:userId", verifyToken, asyncHandler(updatePostLike));
router.patch("/comment/:userId", verifyToken, asyncHandler(commentOnPost));

module.exports = router;    