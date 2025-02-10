const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullname: {type: String, required: true},
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true, min: 6 },
    country: {type:String},
    birthday:{type:Date},
    profilePicture: { type: String },
    gender:{type:String , enum: ["male","female","other"]},
    bio:{type:String},
    role: {
      type: String,
      enum: ["member", "admin"],
      default: "member",
    },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
