import { body } from "express-validator";
import { handleValidationErrors } from "./handleValidationErrors.js";
import { rolesEnum } from "../utils/enum.js";

const validateLogin = [
body("email")
  .notEmpty()
  .withMessage("Email is required")
  .matches(/^[a-zA-Z]+[0-9]+@cloud\.neduet\.edu\.pk$/)
  .withMessage("Email must be a valid university Cloud ID (e.g., siddiqui4720797@cloud.neduet.edu.pk)"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  handleValidationErrors,
];

const validateSignUp = [
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  body("name")
    .notEmpty()
    .withMessage("Name is required")
    .isString()
    .withMessage("Name must be a string"),
  body("role")
    .notEmpty()
    .withMessage("Role is required")
    .isIn(Object.values(rolesEnum))
    .withMessage(`Role must be one of: ${Object.values(rolesEnum).join(", ")}`),
  handleValidationErrors,
];

const validateResetRequest = [
  body("email")
    .notEmpty()
    .withMessage("email is required")
    .isEmail()
    .withMessage("Please enter a valid email address"),
  handleValidationErrors,
];

// validateVerifyOtp: [
//   body('email')
//     .notEmpty().withMessage('Email is required')
//     .isEmail().withMessage('Please enter a valid email address'),
//   body('otp')
//     .notEmpty().withMessage('OTP is required')
//     .isNumeric().withMessage('OTP must be a number')
//     .isLength({ min: 6, max: 6 }).withMessage('OTP must be exactly 6 digits'),
//   handleValidationErrors,
// ],

const validateResetPassword = [
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .matches(/^[a-zA-Z]+[0-9]+@cloud\.neduet\.edu\.pk$/)
    .withMessage("Must be a university cloud ID"),
  body("newPassword")
    .notEmpty()
    .withMessage("New password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .matches(/\d/)
    .withMessage("Password must contain at least one number"),
  handleValidationErrors,
];

const validateVerifyEmail = [
  body("email").notEmpty().isEmail(),
  body("otp").isNumeric().isLength({ min: 6, max: 6 }),
  handleValidationErrors,
];

const validateChangePassword = [
  body("currentPassword").notEmpty(),
  body("newPassword").isLength({ min: 6 }),
  handleValidationErrors,
];

export {
  validateLogin,
  validateSignUp,
  validateResetPassword,
  validateResetRequest,
  validateVerifyEmail,
  validateChangePassword
};
