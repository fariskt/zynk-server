const Post = require("../models/postSchema");

exports.createPost = async (req, res) => {  
    const { content, hideComments ,isScheduled, scheduleTime} = req.body;  
    console.log(isScheduled);
    console.log(scheduleTime);
    
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
      scheduleTime: isScheduled === "true" ? new Date(scheduleTime): null,
    });
  
    await newPost.save();
    res.status(201).json({
      sucess: true,
      message: "Post created successfully",
      data: newPost,
    });
  };
  
  exports.getPosts = async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const posts = await Post.find({ isDeleted: false}).populate("userId", "fullname profilePicture")
      .skip((page - 1) * limit)
      .limit(limit).sort({createdAt: -1})
      
    if (!posts) {
      return res.status(404).json({ message: "Posts not found" });
    }
    const totalPostCount = await Post.countDocuments();
    return res
      .status(200).json({
        sucess: true,
        message: "Posts fetched success",
        posts,
        totalPostCount,
        pageLength: Math.ceil(totalPostCount / limit),
        currentPage: parseInt(page),
      });
  };

  exports.getPostById = async (req, res) => {
    const { postId } = req.params;
    console.log(postId);
    
    
    const post = await Post.findOne({_id: postId , isDeleted: false}).populate("userId", "fullname profilePicture")
    console.log(post);
    
    if (!post) {
      return res.status(404).json({ message: "Posts not found" });
    }

    return res
      .status(200).json({
        sucess: true,
        message: "Post fetched success",
        post
      });
  };
  
  exports.getUserPostById = async (req, res) => {
    const { page = 1, limit = 2 } = req.query;
    const {userId} = req.params
    
    if(!userId){
      return res.status(404).json({message: "User id missing!"})
    }
    const posts = await Post.find({ userId: userId , isDeleted: false }).populate("userId", "fullname profilePicture")
    .sort({createdAt: -1})
    .skip((page - 1) * limit)
    .limit(limit);
  
    const totalPostCount = await Post.countDocuments({userId: userId , isDeleted: false})
    if (!posts) {
      return res.status(404).json({ message: "Posts not found" });
    }
  
    return res
      .status(200).json({
        sucess: true,
        message: "User Posts fetched success",
        posts,
        totalPostCount,
        pageLength: Math.ceil(totalPostCount / limit),
        currentPage: parseInt(page),
      });
  };

  
  exports.updatePostLike = async(req,res)=> {    
    const {userId} = req.params;
    
    const {postId} = req.body

    const post = await Post.findById(postId);
    if (!post) {
        return res.status(404).json({ message: "Post not found" });
    }

    const isLiked = post.likes?.includes(userId);    
    
    const updatedPost = await Post.findOneAndUpdate(
      { _id: postId},
      isLiked ? { $pull: {likes: userId}} : { $addToSet: {likes: userId}},
      {new : true}
    );
    
    return res.status(200).json({
      sucess: true,
       message: updatedPost.likes.includes(userId) ? "Post Liked": "Post disliked",
       likesCount: updatedPost.likes.length,
       data: updatedPost
      });
    }
  
  exports.commentOnPost =async(req,res)=> {
    const {userId , postId,text } = req.body
    console.log(req.body);
    const post = await Post.findById(postId);
    if(!post){
      return res.status(404).json({ message: "Post not found" });
    }
    const updateComment = await Post.findByIdAndUpdate(
      postId, 
      {$push : {userId : userId, text: text, likes: 0}},
      {new : true}
    )
    console.log(updateComment);
    return res.status(200).json({message: "Commented on post", success: true, data: updateComment})
    
  }