import mongoose from "mongoose"

const notificationSchema = ({
    receiver:{type: mongoose.Schema.Types.ObjectId, ref: "User"},
    sender: {type: mongoose.Schema.Types.ObjectId, ref: "User"},
    text: {type: String, required: true},
    type: { 
        type: String, 
        enum: ['follow', 'like', 'comment', 'share', 'mention'], 
        default: 'follow' 
    },
    read: {type: Boolean, default: false},
    createdAt: { type: Date, default: Date.now }
})

const Notification = mongoose.model("Notification",notificationSchema)

export default Notification