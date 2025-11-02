import { body, param, query } from "express-validator";
import mongoose from "mongoose";
import { handleValidationErrors } from "./handleValidationErrors.js";

// Helper to check ObjectId validity
const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const createTeacherProfileValidation = [
  body("facultyId")
    .trim()
    .notEmpty().withMessage("Faculty Id is required")
    .matches(/^[A-Za-z0-9-_]+$/).withMessage("rollNumber must be alphanumeric"),
  body("department")
    .notEmpty().withMessage("Department is required")
    .isString().withMessage("Department must be a string")
    .trim(),
  body("designation")
    .optional()
    .isIn(["Professor", "Associate Professor", "Assistant Professor", "Lecturer"])
    .withMessage("Invalid designation"),
  body("teach")
    .optional()
    .isArray().withMessage("teach must be an array of course IDs")
    .custom((arr) => arr.every(isValidObjectId))
    .withMessage("Each course ID in teach must be a valid MongoDB ObjectId"),
  body("contactNumber")
    .optional()
    .matches(/^\+?[0-9]{10,15}$/)
    .withMessage("Invalid phone number format"),
  handleValidationErrors
];

const updateTeacherProfileValidation = [
  body("facultyId")
    .optional()
    .isString().withMessage("Faculty ID must be a string")
    .trim(),
  body("department")
    .optional()
    .isString().withMessage("Department must be a string")
    .trim(),
  body("designation")
    .optional()
    .isIn(["Professor", "Associate Professor", "Assistant Professor", "Lecturer"])
    .withMessage("Invalid designation"),
  body("contactNumber")
    .optional()
    .matches(/^\+?[0-9]{10,15}$/)
    .withMessage("Invalid phone number format"),
  handleValidationErrors
];

const assignCourseValidation = [
  param("courseId")
    .custom(isValidObjectId)
    .withMessage("Invalid courseId"),
  handleValidationErrors
];

const unassignCourseValidation = [
  param("courseId")
    .custom(isValidObjectId)
    .withMessage("Invalid courseId"),
  handleValidationErrors
];


const deleteTeacherProfileValidation = [
  param("teacherId")
    .optional()
    .custom(isValidObjectId)
    .withMessage("Invalid teacherId"),
  handleValidationErrors
];

export {
  createTeacherProfileValidation,
  updateTeacherProfileValidation,
  assignCourseValidation,
  unassignCourseValidation,
  deleteTeacherProfileValidation
}
