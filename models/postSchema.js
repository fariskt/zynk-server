import mongoose from "mongoose"

const postSchema = new mongoose.Schema({
    userId: {type: mongoose.Schema.Types.ObjectId, required: true, ref: "User"},
    content: {type:String, required: true},
    image:{type: String},
    likes: [{type: mongoose.Schema.Types.ObjectId, ref:"User"}],
    hideComments:{type: Boolean, default: false},
    scheduleTime: {type: Date, default: null},
    isScheduled: {type: Boolean, default: false},
    commentCount:{type:Number, default: 0},
    isDeleted: {type: Boolean, default : false}
},{timestamps: true})

const Post = mongoose.model("Post", postSchema)

export default Post