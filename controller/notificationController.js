import Notification from "../models/notificationSchema.js";

export const getNotification = async(req,res)=> {
    const userId = req.user.id;
    
    const notification = await Notification.find({receiver: userId}).sort({createdAt: -1}).limit(20).populate("sender", "fullname profilePicture")
    
    if(!notification){
        return res.status(200).json({message : "No notification found"})
    }
    res.status(200).json({message : "Notification fetched success", notification, success: true})
}