import express from "express";
import { verifyJWT } from "../middlewares/auth.js";
import {
  createStudentProfile,
  getStudentProfile,
  updateStudentProfile,
  enrollInCourse,
  unenrollFromCourse,
  listEnrolledCourses,
  deleteStudentProfile,
} from "../controllers/student.controller.js";
import {
  createStudentProfileValidation,
  updateStudentProfileValidation,
  enrollCourseValidation,
  unenrollCourseValidation,
  listEnrolledCoursesValidation,
  deleteStudentProfileValidation
} from "../middlewares/studentValidation.js";
import upload from "../middlewares/multer.js";

const router = express.Router();

router.use(verifyJWT);

router.post("/", createStudentProfileValidation, createStudentProfile);
router.get("/", getStudentProfile);
router.patch("/", updateStudentProfileValidation,updateStudentProfile);
router.post("/:courseId/enroll", enrollCourseValidation, enrollInCourse);
router.post("/:courseId/unenroll", unenrollCourseValidation, unenrollFromCourse);
router.get("/enrolled", listEnrolledCoursesValidation, listEnrolledCourses);
router.delete("/profile/:studentId", deleteStudentProfileValidation, deleteStudentProfile);

export default router;


