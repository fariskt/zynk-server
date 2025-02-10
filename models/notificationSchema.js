const mongoose = require("mongoose")

const notificationSchema = ({
    reciever:{type: mongoose.Schema.Types.ObjectId, ref: "User"},
    sender: {type: mongoose.Schema.Types.ObjectId, ref: "User"},
    text: {type: String, required: true},
    read: {type: Boolean, default: false}
})

const Notification = mongoose.model("Notification",notificationSchema)

module.exports = Notification