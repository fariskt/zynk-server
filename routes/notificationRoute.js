import express from "express"
const router = express.Router()
import asyncHandler from "../middleware/errorHandler.js";
import verifyToken from "../middleware/verifyToken.js";

import { getNotification } from "../controller/notificationController.js"

router.get("/allNotification", verifyToken , asyncHandler(getNotification));


export default router;    