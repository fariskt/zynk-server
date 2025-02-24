import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
    senderId: {type:mongoose.Schema.Types.ObjectId, ref: "User"},
    receiverId: {type:mongoose.Schema.Types.ObjectId, ref: "User"},
    text: {type: String, required: true},
    timestamp: {type: Date, default: Date.now}
})

const Chat = mongoose.model("Chat", chatSchema);
export default Chat