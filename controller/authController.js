import User  from "../models/userSchema.js";
import bcrypt  from "bcrypt" ;
import { generateAccessToken }  from "../utils/generateJwt.js";
import crypto  from "crypto";
import { sendEmail }  from "../helpers/nodeMailer.js";

export const registerUser = async (req, res) => {
  const { fullname, email, password } = req.body;
  const existsUserWithEmail = await User.findOne({ email: email });
  if (existsUserWithEmail) {
    return res.status(400).json({ message: "User already exists" });
  }


  const hashPassword = await bcrypt.hash(password, 10);

  const newUser = new User({
    fullname,
    email,
    password: hashPassword,
    followers: [],
    following: [],
  });

  await newUser.save();
  res.status(201).json({
    success: true,
    message: "User registered sucessfully",
    user: {
      id: newUser._id,
      fullname: newUser.fullname,
      email: newUser.email,
      role: newUser.role
    },
  });
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Please provide email or username and password",
    });
  }

  const user = await User.findOne({ email: email })
  if (!user) {
    return res.status(400).json({ message: "User not exists" });
  }

  const matchPassword = await bcrypt.compare(password, user.password);
  if (!matchPassword) {
    return res.status(400).json({ message: "Invalid email or password" });
  }

  const accessToken = generateAccessToken({
    id: user._id,
    email: user.email,
    role: user.role,
  });

  res.cookie("token", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // Automatically set based on environment
    sameSite: "Strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });


  res.status(200).json({
    success: true,
    message: "Login successful",
    user: {
      _id: user._id,
      fullname: user.fullname,
      email: user.email,
      role: user.role,
      following: user.following,
      followers: user.followers,
      bio:user?.bio,
      gender:user?.gender,
      birthday:user?.birthday,
      country:user?.country,
      profilePicture:user.profilePicture || undefined,
    },
  });
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email: email });
  if (!user) {
    return res.status(404).json({ message: "Your email is wrong" });
  }
  const resetToken = crypto.randomBytes(20).toString("hex");
  const resetTokenExpiration = Date.now() + 36000;

  user.resetPasswordToken = resetToken;
  user.resetPasswordExpires = resetTokenExpiration;
  await user.save();

  const resetLink = `http://localhost:3000/reset-password?token=${resetToken}`;
  const emailBody = `Click the link below to reset your password:\n\n${resetLink}`;

  await sendEmail(user.email, "Password reset request", emailBody);
  res.status(200).json({ success: true, message: "Password reset email sent" });
};

export const resetPassword = async (req, res) => {
  const { newPassword, token } = req.body;

  const user = await User.findOne({ resetPasswordToken: token });
  if (!user) {
    return res.status(400).json({ message: "Invalid token" });
  }

  if (user.resetPasswordExpires < Date.now()) {
    return res
      .status(400)
      .json({ sucess: false, message: "Token has expired" });
  }
  const hashPass = await bcrypt.hash(newPassword, 10);
  user.password = hashPass;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();
  res.status(200).json({ success: true, message: "Password has been reset" });
};

export const logout = async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: false,
  });
  return res.status(200).json({ message: "Logged out successfully" });
};

export const getLoginedUser = async (req, res) => {
  const userId = req.user.id;
  const user = await User.findOne({ _id: userId }).select("-password")
  if (!user) {
    return res.status(401).json({ message: "User not found" });
  }
  res.status(200)
    .json({ success: true, message: "User fetched sucessfully", user });
};


