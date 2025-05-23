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
    !newComment.parentCommentId &&
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

export const getCommentByPostId = async (req, res) => {
  const { postId } = req.params;

  const post = await Post.findById(postId);
  if (!post) {
    return res.status(404).json({ message: "Post not found" });
  }

  const comments = await Comment.find({ postId, parentCommentId: null })
    .populate("userId", "fullname profilePicture")
    .sort({ createdAt: -1 }).lean()

    const comentsWithReplyCount = await Promise.all(
      comments.map(async (comment)=> {
        const replyCount = await Comment.countDocuments({parentCommentId: comment._id})
        return {...comment, replyCount}
      })
    )

  if (!comments) {
    return res.status(404).json({ message: "No comments on this post" });
  }

  return res.status(200).json({
    message: "Comment fetched success",
    success: true,
    data: comentsWithReplyCount,
  });
};

//reply
export const replayToComment = async (req, res) => {
  console.log("come");
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

export const getCommentReplies = async (req, res) => {
  const { commentId } = req.params;
  const replies = await Comment.find({ parentCommentId: commentId })
    .populate("userId", "fullname profilePicture")
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, replies });
};

export const toggleLikeUnlikeComment = async (req,res) => {
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
};
