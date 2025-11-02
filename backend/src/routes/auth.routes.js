import express from "express";
import { verifyJWT } from "../middlewares/auth.js";
import {
  registerUser,
  // verifyEmail,
  loginUser,
  logoutUser,
  // resendVerificationOtp,
  // resetPassword,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  deleteUser,
} from "../controllers/auth.controller.js";
import {
  validateLogin,
  validateSignUp,
  // validateResetPassword,
  // validateResetRequest,
  validateChangePassword,
  // validateVerifyEmail
} from "../middlewares/authValidation.js";
import upload from "../middlewares/multer.js";

const router = express.Router();

router.post("/register", upload('images/avatars', [
    'image/png',
    'image/jpg',
    'image/jpeg',
]).single('avatar'), validateSignUp, registerUser);
// router.post("/verify-email", validateVerifyEmail, verifyEmail);
router.post("/login", validateLogin, loginUser);
router.post("/logout", verifyJWT, logoutUser);
// router.post("/resend-otp", resendVerificationOtp);
// router.post("/reset-password", validateResetPassword, resetPassword);
router.post("/change-password", verifyJWT, validateChangePassword, changeCurrentPassword);
router.get("/current-user", verifyJWT, getCurrentUser);
router.patch("/update", verifyJWT, updateAccountDetails);
router.patch("/update-avatar", upload('images/avatars', [
    'image/png',
    'image/jpg',
    'image/jpeg',
]).single('avatar'), verifyJWT, updateUserAvatar);
router.delete("/", verifyJWT, deleteUser);

export default router;