import { body, param, query } from "express-validator";
import mongoose from "mongoose";
import { handleValidationErrors } from "./handleValidationErrors.js";

// Helper to check ObjectId validity
const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const createStudentProfileValidation = [
  body("rollNumber")
    .trim()
    .notEmpty().withMessage("rollNumber is required")
    .matches(/^[A-Za-z0-9-_]+$/).withMessage("rollNumber must be alphanumeric"),
  body("year")
    .notEmpty().withMessage("year is required")
    .isInt({ min: 1 }).withMessage("year must be a positive integer"),
  body("program")
    .trim()
    .notEmpty().withMessage("program is required")
    .isLength({ min: 2 }).withMessage("program must be at least 2 characters"),
  body("contactNumber")
    .optional()
    .matches(/^\+?[0-9]{10,15}$/)
    .withMessage("contactNumber must be a valid international phone number"),
  body("enrolledCourses")
    .optional()
    .isArray().withMessage("enrolledCourses must be an array")
    .custom((arr) => arr.every((id) => isValidObjectId(id)))
    .withMessage("All enrolledCourses must be valid ObjectIds"),
  handleValidationErrors
];

const updateStudentProfileValidation = [
  body("rollNumber")
    .optional()
    .matches(/^[A-Za-z0-9-_]+$/).withMessage("rollNumber must be alphanumeric"),
  body("year")
    .optional()
    .isInt({ min: 1 }).withMessage("year must be a positive integer"),
  body("program")
    .optional()
    .isLength({ min: 2 }).withMessage("program must be at least 2 characters"),
  body("contactNumber")
    .optional()
    .matches(/^\+?[0-9]{10,15}$/)
    .withMessage("contactNumber must be a valid international phone number"),
  body("isActive")
    .optional()
    .isBoolean().withMessage("isActive must be a boolean value"),
  handleValidationErrors
];

const enrollCourseValidation = [
  param("courseId")
    .custom(isValidObjectId)
    .withMessage("Invalid courseId"),
  handleValidationErrors
];

const unenrollCourseValidation = [
  param("courseId")
    .custom(isValidObjectId)
    .withMessage("Invalid courseId"),
  handleValidationErrors
];

const listEnrolledCoursesValidation = [
  query("studentId")
    .optional()
    .custom(isValidObjectId)
    .withMessage("Invalid studentId"),
  handleValidationErrors
];

const deleteStudentProfileValidation = [
  param("studentId")
    .optional()
    .custom(isValidObjectId)
    .withMessage("Invalid studentId"),
  handleValidationErrors
];

export {
  createStudentProfileValidation,
  updateStudentProfileValidation,
  enrollCourseValidation,
  unenrollCourseValidation,
  listEnrolledCoursesValidation,
  deleteStudentProfileValidation
}
