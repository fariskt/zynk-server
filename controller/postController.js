import Notification from "../models/notificationSchema.js";
import Post from "../models/postSchema.js";
import User from "../models/userSchema.js";


export const createPost = async (req, res) => {
  const { content, hideComments, isScheduled, scheduleTime } = req.body;

  const postImage = req.file ? req.file.path : undefined;
  if (!content) {
    return res.status(400).json({ message: "Please fill filed" });
  }

  const newPost = new Post({
    userId: req.user.id,
    content: content,
    image: postImage,
    hideComments: hideComments === "true",
    isScheduled: isScheduled === "true",
    scheduleTime: isScheduled === "true" ? new Date(scheduleTime) : null,
  });

  await newPost.save();
  await User.findByIdAndUpdate(req.user.id, { $inc: { postCount: 1 } });

  res.status(201).json({
    sucess: true,
    message: "Post created successfully",
    data: newPost,
  });
};

export const getPosts = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const posts = await Post.find({ isDeleted: false })
    .populate("userId", "fullname profilePicture")
    .skip((page - 1) * limit)
    .limit(limit)
    .sort({ createdAt: -1 });

  if (!posts) {
    return res.status(404).json({ message: "Posts not found" });
  }
  const totalPostCount = await Post.countDocuments({isDeleted: false});
  return res.status(200).json({
    sucess: true,
    message: "Posts fetched success",
    posts,
    totalPostCount,
    pageLength: Math.ceil(totalPostCount / limit),
    currentPage: parseInt(page),
  });
};

export const getPostById = async (req, res) => {
  const { postId } = req.params;

  const post = await Post.findOne({ _id: postId, isDeleted: false }).populate(
    "userId",
    "fullname profilePicture"
  );
  if (!post) {
    return res.status(404).json({ message: "Posts not found" });
  }

  return res.status(200).json({
    sucess: true,
    message: "Post fetched success",
    post,
  });
};

export const getUserPostById = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const { userId } = req.params;

  if (!userId) {
    return res.status(404).json({ message: "User id missing!" });
  }
  const posts = await Post.find({ userId: userId, isDeleted: false })
    .populate("userId", "fullname profilePicture")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  const totalPostCount = await Post.countDocuments({
    userId: userId,
    isDeleted: false,
  });
  if (!posts) {
    return res.status(404).json({ message: "Posts not found" });
  }

  return res.status(200).json({
    sucess: true,
    message: "User Posts fetched success",
    posts,
    totalPostCount,
    pageLength: Math.ceil(totalPostCount / limit),
    currentPage: parseInt(page),
  });
};

export const updatePostLike = async (req, res) => {
  const { userId } = req.params;
  const loggedUserId = req.user.id
  const loggedUser = await User.findById(loggedUserId);

  if(!loggedUser){
    return res.status(404).json({ message: "User not found" });
  }

  const { postId } = req.body;

  const post = await Post.findById(postId);
  if (!post) {
    return res.status(404).json({ message: "Post not found" });
  }

  const isLiked = post.likes?.includes(userId);

  const updatedPost = await Post.findOneAndUpdate(
    { _id: postId },
    isLiked ? { $pull: { likes: userId } } : { $addToSet: { likes: userId } },
    { new: true }
  );

  if (!isLiked && post.userId.toString() !== loggedUserId) {
    const notification = new Notification({
      receiver: post.userId,
      sender: loggedUserId,
      type: "like",
      text: `${loggedUser.fullname} liked your post.`,
    });

    await notification.save();

    req.io.to(post.userId.toString()).emit("receive_notification", {
      sender: loggedUser.fullname,
      senderId: loggedUser._id,
      text: `${loggedUser.fullname} liked your post.`,
      sender: {
        profilePicture: loggedUser?.profilePicture,
      },
      timestamp: new Date(),
    });
  }

  return res.status(200).json({
    sucess: true,
    message: updatedPost.likes.includes(userId)
      ? "Post Liked"
      : "Post disliked",
    likesCount: updatedPost.likes.length,
    data: updatedPost,
  });
};

export const updatePost = async (req, res) => {
  const { postId } = req.params;
  const { content, hideComments } = req.body;
  const userId = req.user.id;

  const post = await Post.findById(postId);
  if (!post) {
    return res.status(404).json({ message: "No post found" });
  }
  if (post.userId.toString() !== userId) {
    return res
      .status(403)
      .json({ message: "Unauthorized to update this post" });
  }
  if (content) {
    post.content = content;
  }
  if (typeof hideComments !== "undefined") {
    post.hideComments = hideComments;
  }

  await post.save();
  res.status(200)
    .json({ success: true, message: "Post Updated success", post });
};

export const deletePostByUser = async(req,res)=> {
  const postId = req.params.postId;
  const userId = req.user.id;
  
  const post = await Post.findById(postId)
  if(post.userId.toString() !== userId) {
    return res.status(403).json({message : "Unauthorized to delete this post"})
  }
  post.isDeleted = true
  await post.save()
  res.status(200).json({success: true, message: "Post deleted successfully"})
}
