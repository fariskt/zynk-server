import Comment from "../models/commentSchema.js";
import Notification from "../models/notificationSchema.js";
import Post from "../models/postSchema.js";
import User from "../models/userSchema.js";

export const editProfile = async (req, res) => {
  const { gender, country, bio, birthday } = req.body;
  const userId = req.user.id;
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  if (gender) user.gender = gender;
  if (country) user.country = country;
  if (bio) user.bio = bio;
  if (birthday) user.birthday = birthday;

  await user.save();
  res.status(200).json({ message: "Profile updated successfully" });
};

export const editProfileAndCoverPhoto = async (req, res) => {
  const userId = req.user.id;

  const profilePhoto = req.files["profilePicture"] ? req.files["profilePicture"][0].path : null;
  const coverPhoto = req.files["coverPhoto"] ? req.files["coverPhoto"][0].path : null;

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    {
      ...(profilePhoto && { profilePicture: profilePhoto }),
      ...(coverPhoto && { coverPhoto: coverPhoto }),
    },
    { new: true }
  );

  if (!updatedUser) {
    return res.status(404).json({ message: "No user found" });
  }

  res.status(200).json({
    message: "Photos uploaded and user updated successfully",
    user: updatedUser,
  });
};

export const getUserById = async (req, res) => {
  const { userId } = req.params;  
  const user = await User.findById(userId).select("-password");
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  res
    .status(200)
    .json({ message: "User fetchted successfully", success: true, user });
};

export const getUsers = async (req, res) => {
  const loggedUser = req.user.id;
  const { page = 1, limit = 10, search = "" } = req.query;

  const query = {
    _id: { $ne: loggedUser },
    ...(search ? { fullname: { $regex: search, $options: "i" } } : {}),
  };

  const users = await User.find(query)
    .skip((page - 1) * limit)
    .limit(limit)
    .select("-password");

  if (!users || users.length === 0) {
    return res.status(404).json({ message: "No users found" });
  }

  const totalUserCount = await User.countDocuments(query);
  return res.status(200).json({
    message: "Users fetched successfully",
    success: true,
    data: users,
    totalUserCount,
    pageLength: Math.ceil(totalUserCount / limit),
    currentPage: parseInt(page),
  });
};

export const sendFollowRequest = async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(404).json({ message: "User not exits", success: false });
  }
  const loggedUserId = req.user.id;
  const loggedUser = await User.findById(loggedUserId);

  const isFollowed = loggedUser.following.includes(userId);
  const isFollowing = loggedUser.followers.includes(userId);

  const updateFollowingList = await User.findByIdAndUpdate(
    loggedUserId,
    isFollowed
      ? { $pull: { following: userId } }
      : { $addToSet: { following: userId } }
  );

  const updateFollowersList = await User.findByIdAndUpdate(
    userId,
    isFollowing
      ? { $pull: { followers: loggedUserId } }
      : { $addToSet: { followers: loggedUserId } }
  );

  if (!updateFollowersList || !updateFollowingList) {
    return res
      .status(400)
      .json({ message: "Failed to follow user", success: false });
  }

  //only for follow not unfollow
  if (!isFollowed) {
    const notification = new Notification({
      receiver: userId,
      sender: loggedUserId,
      text: `${loggedUser.fullname} followed you.`,
    });

    await notification.save();
    req.io.to(userId).emit("receive_notification", {
      sender: loggedUser.fullname,
      text: `${loggedUser.fullname} followed you.`,
      profilePicture: loggedUser.profilePicture,
      timestamp: new Date(),
    });
  }

  return res.status(200).json({
    message: isFollowed
      ? "Unfollowed successfully"
      : "Follow request sent successfully",
    success: true,
    data: { updateFollowingList, updateFollowersList },
  });
};

export const getUserFollowers = async (req, res) => {
  const { userId } = req.params;
  const { limit = 10, page = 1 } = req.query;
  let pageLimit = parseInt(limit);
  let pageCount = parseInt(page);

  const user = await User.findById(userId)
    .populate({
      path: "followers",
      select: "fullname profilePicture",
    })
    .lean();

  if (!user) {
    return res.status(404).json({ message: "No user found" });
  }

  const followersID = user.followers.map((f) => f._id);

  const followersData = await User.aggregate([
    { $match: { _id: { $in: followersID } } },
    {
      $lookup: {
        from: "posts",
        localField: "_id",
        foreignField: "userId",
        as: "posts",
      },
    },
    {
      $project: {
        _id: 1,
        fullname: 1,
        profilePicture: 1,
        postCount: { $size: "$posts" },
        followersCount: { $size: "$followers" },
        followingCount: { $size: "$following" },
      },
    },
    { $skip: (pageCount - 1) * pageLimit },
    { $limit: pageLimit },
  ]);

  res
    .status(200)
    .json({ followers: followersData, message: "Followers fetched success" });
};

export const getUserFollowing = async (req, res) => {
  const { userId } = req.params;
  const { limit = 10, page = 1 } = req.query;
  let pageLimit = parseInt(limit);
  let pageCount = parseInt(page);

  const user = await User.findById(userId)
    .populate({
      path: "followers",
      select: "fullname profilePicture",
    })
    .lean();

  if (!user) {
    return res.status(404).json({ message: "No user found" });
  }

  const followingID = user.following.map((f) => f._id);

  const followingData = await User.aggregate([
    { $match: { _id: { $in: followingID } } },
    {
      $lookup: {
        from: "posts",
        localField: "_id",
        foreignField: "userId",
        as: "posts",
      },
    },
    {
      $project: {
        _id: 1,
        fullname: 1,
        profilePicture: 1,
        postCount: { $size: "$posts" },
        followersCount: { $size: "$followers" },
        followingCount: { $size: "$following" },
      },
    },
    { $skip: (pageCount - 1) * pageLimit },
    { $limit: pageLimit },
  ]);

  res.status(200).json({
    following: followingData,
    message: "User Followwing fetched success",
  });
};

export const getRecentActivities = async (req, res) => {
  try {
    const { userId } = req.params;

    const latestComments = await Comment.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("userId", "fullname profilePicture")
      .populate("postId", "content userId");

    // user like activty latest
    const latestLikes = await Post.find({ likes: userId , userId: {$ne: userId} })  
      .sort({ updatedAt: -1 })
      .limit(5)
      .populate("userId", "fullname profilePicture");

    // Format the activities
    const activities = [
      ...latestComments.map((comment) => ({
        type: "comment",
        user: comment.userId, 
        postTitle: comment.postId?.content || "a post",
        postOwner: comment.postId?.userId,
        content: comment.text,
        createdAt: comment.createdAt,
      })),
      ...latestLikes.map((post) => ({
        type: "like",
        user: { fullname: "You", profilePicture: "/person-demo.jpg" }, 
        postTitle: post.content,
        postOwner: post.userId, 
        createdAt: post.updatedAt,
      })),
    ];

    // Sort (latest first)
    activities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return res.status(200).json({ message: "User activity fetched", activities });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};
