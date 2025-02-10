const User = require("../models/userSchema");
const bcrypt = require("bcrypt");
const { generateAccessToken } = require("../utils/generateJwt");
const crypto = require("crypto");
const { sendEmail } = require("../helpers/nodeMailer");

exports.registerUser = async (req, res) => {
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

exports.loginUser = async (req, res) => {
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
    secure: false,
    maxAge: 3600000,
  });

  res.status(200).json({
    success: true,
    message: "Login successful",
    user: {
      id: user._id,
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

exports.forgotPassword = async (req, res) => {
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

exports.resetPassword = async (req, res) => {
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

exports.logout = async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: false,
  });
  return res.status(200).json({ message: "Logged out successfully" });
};

exports.getLoginedUser = async (req, res) => {
  const userId = req.user.id;
  const user = await User.findOne({ _id: userId }).select("-password")
  if (!user) {
    return res.status(401).json({ message: "User not found" });
  }
  res.status(200)
    .json({ success: true, message: "User fetched sucessfully", user });
};


