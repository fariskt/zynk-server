const User = require("../models/userSchema");

exports.editProfile = async (req, res) => {
  const { gender, country, bio, birthday } = req.body;
  const profilePicture = req.file ? req.file.path : undefined;
  const userId = req.user.id;
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  if(gender) user.gender = gender
  if(country) user.country = country
  if(bio) user.bio = bio
  if(birthday) user.birthday = birthday;
  if (profilePicture) user.profilePicture = profilePicture;

  await user.save();
  res.status(200).json({ message: "Profile updated successfully" });
};


exports.getUsers = async(req,res)=> {
  const { page = 1, limit = 10 } = req.query;
  const users = await User.find().skip((page - 1) * limit).limit(limit).select("-password");
  if(!users){
    return res.status(404).json({message: "No users found"})
  }
  const totalUserCount = await User.countDocuments();
  return res.status(200).json({
    message: "Users fetched successfully",
    success: true,
    data: users,
    totalUserCount,
    pageLength: Math.ceil(totalUserCount / limit),
    currentPage: parseInt(page),
  })
}

exports.sendFollowRequest = async(req,res)=> {
  const {userId} = req.body;

  if(!userId){
    return res.status(404).json({message: "User not exits", success : false});
  }
  const loggedUserId = req.user.id;
  const loggedUser = await User.findById(loggedUserId)

  const isFollowed = loggedUser.following.includes(userId);
  const isFollowing = loggedUser.followers.includes(userId);

  const updateFollowingList = await User.findByIdAndUpdate(
    loggedUserId,
    isFollowed ?{ $pull: {following: userId}}: {$addToSet: {following: userId}},
  );

  const updateFollowersList = await User.findByIdAndUpdate(
    userId, 
    isFollowing ? {$pull : {followers: loggedUserId}} : {$addToSet: {followers: loggedUserId}}
  )

  if (!updateFollowersList || !updateFollowingList) {
    return res.status(400).json({ message: "Failed to follow user", success: false });
  }
  return res.status(200).json({
    message: "Follow requset send successfully",
    success: true,
    data: {updateFollowingList, updateFollowersList}
  })
}

exports.getUserFollowers = async(req,res)=> {
  const {userId} = req.params;

  const user = await User.findById(userId).populate({
    path: "followers",
    select: "fullname profilePicture"
  }).lean()

  if(!user){
    return res.status(404).json({message: "No user found"})
  }
  
  const followersID = user.followers.map((f)=> f._id);
  
  const followersData = await User.aggregate([
    {$match : {_id : {$in : followersID}}},
    {$lookup: {
      from: "posts",
      localField: "_id",
      foreignField: "userId",
      as: "posts"
    }},
    {$project: {
      fullname: 1,
      profilePicture: 1,
      postCount: {$size : "$posts"},
      followersCount : {$size: "$followers"},
      followingCount: {$size: "$following"}
    }}
  ]) 
  
  res.status(200).json({followers: followersData, message: "Followers fetched success"})
}


exports.getUserFollowing = async(req,res)=> {
  const {userId} = req.params;

  const user = await User.findById(userId).populate({
    path: "followers",
    select: "fullname profilePicture"
  }).lean()

  if(!user){
    return res.status(404).json({message: "No user found"})
  }
  
  const followingID = user.following.map((f)=> f._id);
  
  const followingData = await User.aggregate([
    {$match : {_id : {$in : followingID}}},
    {$lookup: {
      from: "posts",
      localField: "_id",
      foreignField: "userId",
      as: "posts"
    }},
    {$project: {
      fullname: 1,
      profilePicture: 1,
      postCount: {$size : "$posts"},
      followersCount : {$size: "$followers"},
      followingCount: {$size: "$following"}
    }}
  ]) 

  res.status(200).json({following: followingData, message: "User Followwing fetched success"})
}