import User from "../models/userSchema.js";
import bcrypt from "bcrypt";
import { generateAccessToken } from "../utils/generateJwt.js";
import crypto from "crypto";
import { sendEmail } from "../helpers/nodeMailer.js";
import redisClient from "../config/redis.js";

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
  const token = crypto.randomBytes(20).toString("hex");
  const otp = generateOTP();

  await redisClient.set(
    `otp_session:${token}`,
    JSON.stringify({ email, otp, createdAt: Date.now() }),
    "EX",
    300
  );

  const message = `Your one time password for Zynk is ${otp}. It will expire in 5 minutes.`;
  await sendEmail(email, "Zynk Account Verification Code", message);

  res.cookie("otp_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    maxAge: 300000,
  });

  res.status(201).json({
    success: true,
    message: "User registered sucessfully",
    user: {
      id: newUser._id,
      fullname: newUser.fullname,
      email: newUser.email,
      role: newUser.role,
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

  const user = await User.findOne({ email: email });
  if (!user) {
    return res.status(400).json({ message: "User not exists" });
  }
  if (!user.isVerified) {
    return res
      .status(400)
      .json({ message: "Please verify your account to login" });
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
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
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
      bio: user?.bio,
      gender: user?.gender,
      birthday: user?.birthday,
      country: user?.country,
      profilePicture: user.profilePicture || undefined,
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
  const user = await User.findOne({ _id: userId }).select("-password");
  if (!user) {
    return res.status(401).json({ message: "User not found" });
  }
  res
    .status(200)
    .json({ success: true, message: "User fetched sucessfully", user });
};

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export const verifyOtp = async (req, res) => {
  const { otp } = req.body;
  const otp_token = req.cookies.otp_token;
  const session = await redisClient.get(`otp_session:${otp_token}`);
  if (!session) {
    return res.status(400).json({ error: "OTP session expired or invalid" });
  }

  const { email } = JSON.parse(session);
  const user = await User.findOne({ email });
  if (!otp_token)
    return res.status(400).json({ error: "No OTP session token" });

  const storedOtp = await redisClient.get(`otp_session:${otp_token}`);
  if (!storedOtp)
    return res.status(400).json({ error: "OTP session expired or invalid" });

  try {
    if (storedOtp === otp) {
      user.isVerified = true;
      await user.save();
      await redisClient.del(`otp_session:${otp_token}`);
      return res.json({ message: "OTP verified successfully" });
    } else {
      await redisClient.del(`otp_session:${otp_token}`);
      return res.status(400).json({ error: "Invalid Otp" });
    }
  } catch (error) {
    return res.status(400).json({ error: "Invalid or expired OTP" });
  }
};

export const resendOtp = async (req, res) => {
  const otp_token = req.cookies.otp_token;
  let email;

  if (otp_token) {
    const session = await redisClient.get(`otp_session:${otp_token}`);
    if (session) {
      email = JSON.parse(session).email;
    } else {
      return res.status(400).json({ error: "OTP session expired. Please request a new OTP." });
    }
  } else {
    email = req.body?.email;
    if (!email) {
      return res
        .status(400)
        .json({
          error: "Session expired. Please register or request a new OTP.",
        });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });
  }
  const newOtp = generateOTP();
  const newToken = crypto.randomBytes(20).toString("hex");

  await redisClient.set(
    `otp_session:${newToken}`,
    JSON.stringify({ email, otp: newOtp, createdAt: Date.now() }),
    "EX",
    300
  );

  await redisClient.set(`otp_email_to_token:${email}`, newToken, "EX", 300);

  if (otp_token) await redisClient.del(`otp_session:${otp_token}`);

  const message = `Your new one-time password for Zynk is ${newOtp}, and it will expire in 5 minutes.`;
  await sendEmail(email, "Zynk OTP Verification", message);

  res.cookie("otp_token", newToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
    maxAge: 300000,
  });

  return res.status(200).json({ message: "OTP resent successfully" });
};
