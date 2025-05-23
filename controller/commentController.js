import mongoose from "mongoose";
import Comment from "../models/commentSchema.js";
import Notification from "../models/notificationSchema.js";
import Post from "../models/postSchema.js";
import User from "../models/userSchema.js";

export const commentOnPost = async (req, res) => {
  const { postId, text } = req.body;
  const { userId } = req.params;
  const user = await User.findById(userId);

  if (!postId || !text) {
    return res.status(400).json({ message: "Post ID and text are required" });
  }

  const post = await Post.findById(postId);
  if (!post) {
    return res.status(404).json({ message: "Post not found" });
  }

  const newComment = new Comment({
    userId,
    postId,
    text,
    likes: [],
  });

  await Promise.all([
    newComment.save(),
    Post.findByIdAndUpdate(postId, { $inc: { commentCount: 1 } }),
  ]);

  const notification = new Notification({
    receiver: post.userId,
    sender: userId,
    type: "comment",
    text: `${user.fullname} commented on your post: ${text}.`,
  });

  await notification.save();

  req.io.to(post.userId.toString()).emit("receive_notification", {
    sender: user.fullname,
    senderId: user._id,
    text: `${user.fullname} commented on your post: ${text}.`,
    sender: {
      profilePicture: user?.profilePicture,
    },
    timestamp: new Date(),
  });

  return res.status(200).json({
    message: "Commented on post",
    success: true,
    data: newComment,
  });
};

// export const getAllComments = async (req, res) => {
//   const comments = await Comment.find({ parentCommentId: null })
//     .sort({ createdAt: -1 })
//     .populate({
//       path: "userId",
//       select: "fullname profilePicture",
//     });

//   if (!comments.length) {
//     return res.status(404).json({ message: "No comments found" });
//   }

//   return res.status(200).json({
//     message: "All comments fetched successfully",
//     success: true,
//     data: comments,
//   });
// };

export const getCommentByPostId = async (req, res) => {
  const { postId } = req.params;

  const post = await Post.findById(postId);
  if (!post) {
    return res.status(404).json({ message: "Post not found" });
  }

  const comments = await Comment.find({ postId })
      .populate("userId", "fullname profilePicture") // Get user info
      .sort({ createdAt: -1 });


  if (!comments) {
    return res.status(404).json({ message: "No comments on this post" });
  }

  return res.status(200).json({
    message: "Comment fetched success",
    success: true,
    data: comments,
  });
};

//remove later
export const replayToComment = async (req, res) => {
  const userId = req.user.id;
  const { commentId } = req.params;
  const { text } = req.body;

  const mainComment = await Comment.findById(commentId);
  if (!mainComment) {
    return res.status(404).json({ message: "Comment not found" });
  }

  const reply = new Comment({
    userId,
    postId: mainComment.postId,
    text,
    parentCommentId: commentId,
  });

  await reply.save();

  res.status(201).json({ message: "Replied to comment success", reply });
};

// //remove later
// export const getCommentReplies = async (req, res) => {
//   const { commentId } = req.params;

//   const replies = await Comment.aggregate([
//     { $match: { _id: new mongoose.Types.ObjectId(commentId) } }, // Start from this comment
//     {
//       $graphLookup: {
//         from: "comments",
//         startWith: "$_id",
//         connectFromField: "_id",
//         connectToField: "parentCommentId",
//         as: "allReplies",
//       },
//     },
//     {
//       $unwind: "$allReplies",
//     },
//     {
//       $lookup: {
//         from: "users",
//         localField: "allReplies.userId",
//         foreignField: "_id",
//         as: "allReplies.user",
//       },
//     },
//     { $unwind: "$allReplies.user" },
//     {
//       $group: {
//         _id: "$_id",
//         replies: { $push: "$allReplies" },
//       },
//     },
//   ]);

//   res.status(200).json({
//     message: "Replies fetched successfully",
//     success: true,
//     replies: replies.length > 0 ? replies[0].replies : [],
//   });
// };


// Get replies for a specific comment
export const getCommentReplies = async (req, res) => {
  try {
    const { commentId } = req.params;
    const replies = await Comment.find({ parentCommentId: commentId })
      .populate("user", "fullname username profilePicture")
      .sort({ createdAt: 1 });

    res.status(200).json({ success: true, replies });
    console.log(replies);
    
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch replies", error: error.message });
  }
};


//will use later
export const toggleLikeUnlikeComment = async()=> {
  const { commentId } = req.params;
    const userId = req.user.id;

    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    const isLiked = comment.likes.includes(userId);

    if (isLiked) {
      comment.likes.pull(userId); // Unlike
    } else {
      comment.likes.push(userId); // Like
    }

    await comment.save();

    res.status(200).json({ success: true, likes: comment.likes.length });
}