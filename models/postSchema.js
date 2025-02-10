const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
    userId: {type: mongoose.Schema.Types.ObjectId, required: true, ref: "User"},
    content: {type:String, required: true},
    image:{type: String},
    likes: [{type: mongoose.Schema.Types.ObjectId, ref:"User"}],
    comments: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        text: {type: String,required: true},
        likes: {type:Number},
        date: {type: Date,default: Date.now()}
    }],
    hideComments:{type: Boolean, default: false},
    scheduleTime: {type: Date, default: null},
    isScheduled: {type: Boolean, default: false},
    isDeleted: {type: Boolean, default : false}
},{timestamps: true})

const Post = mongoose.model("Post", postSchema)

module.exports = Post