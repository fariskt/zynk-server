import express from "express";
import asyncHandler  from "../middleware/errorHandler.js"
import { editProfile, getUsers, sendFollowRequest, getUserFollowers, getUserFollowing ,getRecentActivities, getUserById, editProfileAndCoverPhoto} from "../controller/userController.js"
const router = express.Router()
import verifyToken  from "../middleware/verifyToken.js"
import profilePicturesUpload  from "../middleware/profileUpload.js"

router.put("/edit-profile", verifyToken,asyncHandler(editProfile))
router.get("/users", verifyToken,asyncHandler(getUsers))
router.get("/:userId", verifyToken,asyncHandler(getUserById))
router.get("/followers/:userId", verifyToken,asyncHandler(getUserFollowers))
router.get("/recent-activities/:userId", verifyToken,asyncHandler(getRecentActivities))
router.get("/following/:userId", verifyToken,asyncHandler(getUserFollowing))
router.post("/follow-request", verifyToken,asyncHandler(sendFollowRequest))

//edit pictures 
router.post("/updateProfilePicture", verifyToken,
     profilePicturesUpload.fields([{name: "profilePicture", maxCount: 1},{name: "coverPhoto", maxCount: 1}]) 
 , asyncHandler(editProfileAndCoverPhoto))



export default router;