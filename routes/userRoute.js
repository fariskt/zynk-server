const express = require("express")
const asyncHandler = require("../middleware/errorHandler")
const { editProfile, getUsers, sendFollowRequest, getUserFollowers, getUserFollowing } = require("../controller/userController")
const router = express.Router()
const profilePictureUpload = require("../middleware/profileUpload")
const verifyToken = require("../middleware/verifyToken")

router.put("/edit-profile", verifyToken,  profilePictureUpload.single("profilePicture") ,asyncHandler(editProfile))
router.get("/users", verifyToken,asyncHandler(getUsers))
router.get("/followers/:userId", verifyToken,asyncHandler(getUserFollowers))
router.get("/following/:userId", verifyToken,asyncHandler(getUserFollowing))
router.post("/follow-request", verifyToken,asyncHandler(sendFollowRequest))



module.exports = router;