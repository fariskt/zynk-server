import  mongoose  from "mongoose";
import  Chat from "../models/chatModel.js";
import User from "../models/userSchema.js";

export const getMessages = async (req, res) => {
  const { senderId, receiverId } = req.params;
  const messages = await Chat.find({
    $or: [
      { senderId, receiverId },
      { senderId: receiverId, receiverId: senderId },
    ],
  }).sort({ timestamp: 1 });

  if (!messages) {
    return res.status(404).json({ message: "No chat found" });
  }  

  return res.status(200).json({ sucess: true, message: "Chat fetched success", data: messages });
};

export const saveMessage = async (data) => {
  const { senderId, receiverId, text } = data;
  const newMessage = new Chat({ senderId, receiverId, text });
  await newMessage.save();
};

export const getUserChats = async (req, res) => {
  const { userId } = req.params;

  // Validate ObjectId format
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }

  try {
    // Find all chats involving the user
    const messages = await Chat.find({
      $or: [{ senderId: userId }, { receiverId: userId }],
    })
      .populate("senderId", "fullname profilePicture")
      .populate("receiverId", "fullname profilePicture");

    if (!messages.length) {
      return res.status(404).json({ error: "No chats found for the user" });
    }

    // Extract unique users from the messages
    const chatUsers = messages.map((message) => {
      return message.senderId._id.toString() === userId
        ? message.receiverId
        : message.senderId;
    });

    // Remove duplicates
    const uniqueChatUsers = [
      ...new Set(chatUsers.map((user) => user._id.toString())),
    ];

    // Populate user details
    const users = await User.find({ _id: { $in: uniqueChatUsers } });

    res.json(users);
  } catch (error) {
    console.error("Error fetching chat users:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
};



export const getUserSingleChat = async (req, res) => {
  const { userId } = req.params;
  const { otherUserId } = req.query;

  // Validate ObjectId format
  if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(otherUserId)) {
    return res.status(400).json({ error: 'Invalid user ID(s)' });
  }

  try {
    // Fetch messages between the two users
    const messages = await Chat.find({
      $or: [
        { senderId: userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: userId },
      ],
    }).sort({ timestamp: 1 });

    if (!messages.length) {
      return res.status(404).json({ error: 'No messages found between users' });
    }

    res.json({ messages });
  } catch (error) {
    console.error("Error fetching single chat:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
