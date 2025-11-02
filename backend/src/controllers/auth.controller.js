import { asyncHandler } from "../utils/asyncWrapper.js";
import { ApiError } from "../utils/errorHandler.js";
import User from "../models/user.model.js";
import Teacher from "../models/teacher.model.js"
import Student from "../models/student.model.js"
import { ApiResponse } from "../utils/response.js";
import jwt from "jsonwebtoken";
import { sendEmail } from "../config/sendEmail.js";
import Otp from "../models/otp.model.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const generateAccessToken = async (userId) => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const accessToken = user.generateAccessToken();

    await user.save({ validateBeforeSave: false });
    return { accessToken };
  } catch (error) {
    console.error("Token generation error:", error);
    throw new ApiError(
      500,
      "Something Went Wrong while generating access token"
    );
  }
};

const sanitizeUser = (userDoc) => {
  if (!userDoc) return null;
  const user = userDoc.toObject ? userDoc.toObject() : { ...userDoc };
  delete user.password;
  delete user.__v;
  return user;
};

const deleteAvatarFileByName = (filename) => {
  if (!filename) return;
  try {
    const avatarsDir = path.join(process.cwd(), "images", "avatars"); // root/images/avatars
    const filePath = path.join(avatarsDir, filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch (err) {
    console.error("Error deleting avatar file:", err);
  }
};


const verificationEmailHtml = (name, otp, frontendVerifyUrl) => `
  <div>
    <p>Hi ${name || "there"},</p>
    <p>Please verify your email for the Intelligent Quiz Platform. Use the code below (expires in 10 minutes):</p>
    <h2>${otp}</h2>
    <p>Or click the link to verify:</p>
    <a href="${frontendVerifyUrl}">Verify email</a>
    <p>If you didn't request this, ignore this email.</p>
  </div>
`;


const resetPasswordEmailHtml = (name, otp, frontendResetUrl) => `
  <div>
    <p>Hi ${name || "there"},</p>
    <p>You requested a password reset. Use the code below (expires in 10 minutes):</p>
    <h2>${otp}</h2>
    <p>Or click the link to reset your password:</p>
    <a href="${frontendResetUrl}">Reset password</a>
    <p>If you didn't request this, ignore this email.</p>
  </div>
`;

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, role, password } = req.body;

  const avatarFilename = req.file ? req.file.filename : null;
  const existedUser = await User.findOne({ email });

  if (existedUser) {
    if (avatarFilename) deleteAvatarFileByName(avatarFilename);
    throw new ApiError(409, "Email already registered");
  }


  const user = await User.create({
    name,
    avatar: req.file ? req.file.filename : null,
    email,
    password,
    role,
    isVerified: true,
    profileCompleted: false
  });

  // if (role === "student") await Student.create({ student: user._id });
  // if (role === "teacher") await Teacher.create({ teacher: user._id });

  if (!user) {
    if (avatarFilename) deleteAvatarFileByName(avatarFilename);
    throw new ApiError(500, "Internal Server Error");
  }

  // const otp = await Otp.generateOtp(email, "email_verification"); // returns generated otp

  // const frontendVerifyUrl = `${process.env.FRONTEND_URL}/auth/verify-email?email=${encodeURIComponent(
  //   email
  // )}`;

  // await sendEmail(email, "Verify your account", verificationEmailHtml(name, otp, frontendVerifyUrl));

  const userWithAvatarUrl = {
    ...user._doc,
    avatarUrl: user.avatar
      ? `${req.protocol}://${req.get("host")}/images/avatars/${user.avatar}`
      : null,
  };

  // return res
  //   .status(201)
  //   .json(
  //     new ApiResponse(
  //       201,
  //       { email: userWithAvatarUrl.email, userId: userWithAvatarUrl._id, role: userWithAvatarUrl.role },
  //       "Account created — verify your email"
  //     )
  //   );

  return res
  .status(201)
  .json(new ApiResponse(201, sanitizeUser(userWithAvatarUrl), "User registered successfully"));
});

const resendVerificationOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) throw new ApiError(400, "Email is required");

  const user = await User.findOne({ email });
  if (!user) throw new ApiError(404, "User not found");
  if (user.isVerified) throw new ApiError(400, "Email already verified");

  const otp = await Otp.generateOtp(email, "email_verification");

  const frontendVerifyUrl = `${process.env.FRONTEND_URL}/auth/verify-email?email=${encodeURIComponent(
    email
  )}`;

  await sendEmail(
    email,
    "Your verification code",
    verificationEmailHtml(user.name, otp, frontendVerifyUrl)
  );

  return res.json(new ApiResponse(200, { email }, "Verification code resent"));
});

const verifyEmail = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) throw new ApiError(400, "Email and OTP are required");

  const otpRecord = await Otp.findOne({ email, purpose: "email_verification" }).sort({createdAt: -1});
  if (!otpRecord) throw new ApiError(400, "OTP not found or expired");

  if (otpRecord.expiresAt && new Date() > new Date(otpRecord.expiresAt)) {
    throw new ApiError(400, "OTP expired");
  }

  if (otpRecord.verified) throw new ApiError(400, "OTP already used");

  if (String(otpRecord.otp) !== String(otp))
    throw new ApiError(400, "Invalid OTP");

  const user = await User.findOneAndUpdate(
    { email },
    { isVerified: true },
    { new: true }
  );
  if (!user) throw new ApiError(404, "User not found");

  otpRecord.verified = true;
  await otpRecord.save();

  return res.json(
    new ApiResponse(200, { user: sanitizeUser(user) }, "Email verified")
  );
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  if (!user.isVerified)
    throw new ApiError(403, "Please verify your email before logging in");

  const { accessToken } = await generateAccessToken(user._id);

  user.lastLogin = new Date();
  await user.save();

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    // maxAge: (parseInt(process.env.ACCESS_TOKEN_EXPIRY, 10) || 20 * 60) * 1000,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .json(
      new ApiResponse(200, sanitizeUser(user), "User logged In Successfully")
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .json(new ApiResponse(200, {}, "Logged Out"));
});

const requestPasswordReset = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) throw new ApiError(400, "Email is required");

  const user = await User.findOne({ email });
  if (!user) {
    return res.json(
      new ApiResponse(
        200,
        {},
        "If the email exists, a reset code has been sent"
      )
    );
  }

  const otp = await Otp.generateOtp(email, "password_reset");
  const frontendResetUrl = `${
    process.env.FRONTEND_URL
  }/auth/reset-password?email=${encodeURIComponent(email)}`;

  await sendEmail(
    email,
    "Password reset code",
    resetPasswordEmailHtml(user.name, otp, frontendResetUrl)
  );

  return res.json(
    new ApiResponse(200, {}, "If the email exists, a reset code has been sent")
  );
});

const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!newPassword || !email || !otp) {
    throw new ApiError(400, "Missing required fields");
  }

  const otpRecord = await Otp.findOne({ email, purpose: "password_reset" });
  if (!otpRecord) throw new ApiError(400, "OTP not found or expired");
  if (otpRecord.verified) throw new ApiError(400, "OTP already used");
  if (String(otpRecord.otp) !== String(otp))
    throw new ApiError(400, "Invalid OTP");

  const user = await User.findOne({ email }).select("+password");
  if (!user) throw new ApiError(401, "User not found");

  user.password = newPassword;

  await user.save();

  otpRecord.verified = true;
  await otpRecord.save();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password reset successfull"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  const user = req.user;

  const userWithAvatarUrl = {
    ...user._doc,
    avatarUrl: user.avatar
      ? `${req.protocol}://${req.get("host")}/images/avatars/${user.avatar}`
      : null,
  };
  if (!user) throw new ApiError(401, "Unauthorized");
  return res
    .status(200)
    .json(
      new ApiResponse(200, { user: sanitizeUser(userWithAvatarUrl) }, "Current User fetched")
    );
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const userId = req.user && req.user._id;
  if (!userId) throw new ApiError(401, "Unauthorized");
  const { name, email } = req.body;

  if (!name && !email) {
    throw new ApiError(400, "At least one field is required");
  }

  const updated = await User.findByIdAndUpdate(
    userId,
    { name, email },
    { new: true }
  ).select("-password");

  const userWithAvatarUrl = {
    ...updated._doc,
    avatarUrl: updated.avatar
      ? `${req.protocol}://${req.get("host")}/images/avatars/${updated.avatar}`
      : null,
  };

  return res
    .status(200)
    .json(new ApiResponse(200, {user: sanitizeUser(userWithAvatarUrl)}, "Account details updated successfully"));
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw new ApiError(400, "Both old and new passwords are required");
  }

  const user = await User.findById(req.user?._id).select("+password");
  if (!user) throw new ApiError(401, "User not authenticated");

  const isPasswordCorrect = await user.isPasswordCorrect(currentPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid Current Password");
  }

  user.password = newPassword;

  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user?._id);
  if (!user) {
    if (req.file) deleteAvatarFileByName(req.file.filename);
    throw new ApiError(404, "User not found");
  }
  const updateData = {};
    if (req.file) {
        if (user.avatar) deleteAvatarFileByName(user.avatar);
        updateData.avatar = req.file.filename;
        
    }
    

  if (req.body.removeAvatar && user.avatar) {
    deleteAvatarFileByName(user.avatar);
    updateData.avatar = null;
  }

    const updatedAvatar = await User.findByIdAndUpdate(req.user._id, { $set: updateData }, { new: true }).select("-password");
    const updatedAvatarWithUrl = {
        ...updatedAvatar._doc,
        avatarUrl: updatedAvatar.avatar ? `${req.protocol}://${req.get("host")}/images/avatars/${updatedAvatar.avatar}` : null
    };

  return res
    .status(200)
    .json(new ApiResponse(200,{ user: sanitizeUser(updatedAvatarWithUrl) }, "Avatar image updated successfully"));
});

const deleteUser = asyncHandler(async (req, res) => {
  const actor = req.user; // populated by verifyJWT
  const targetUserId = req.params?.id || actor._id;

  if (actor.role !== "admin" && String(targetUserId) !== String(actor._id)) {
    throw new ApiError(403, "Forbidden");
  }

  // remove user and cascade/cleanup if needed (attempts, profiles) - keep minimal here
  const user = await User.findById(targetUserId);
  if (user.role === "student") await Student.deleteOne({ student: user._id });
  if (user.role === "teacher") await Teacher.deleteOne({ teacher: user._id });

  if (user && user.avatar) deleteAvatarFileByName(user.avatar);
  const deleted = await User.findByIdAndDelete(targetUserId);

  return res.json(new ApiResponse(200, {}, "User deleted"));
});

export {
  registerUser,
  verifyEmail,
  loginUser,
  logoutUser,
  resendVerificationOtp,
  resetPassword,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  deleteUser,
};
