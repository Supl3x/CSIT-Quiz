import express from "express";
import { verifyJWT } from "../middlewares/auth.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";
import {
    createTeacherProfile,
    getTeacherProfile,
    updateTeacherProfile,
    assignCourse,
    unassignCourse,
    listTaughtCourses,
    deleteTeacherProfile,
    ensureTeacherProfileCompleted
} from "../controllers/teacher.controller.js";
import {
  createTeacherProfileValidation,
  updateTeacherProfileValidation,
  assignCourseValidation,
  unassignCourseValidation,
  deleteTeacherProfileValidation
} from "../middlewares/teacherValidation.js";

const router = express.Router();

router.use(verifyJWT);

router.post("/", createTeacherProfileValidation, createTeacherProfile);
router.get("/", ensureTeacherProfileCompleted, getTeacherProfile);
router.patch("/", updateTeacherProfileValidation, ensureTeacherProfileCompleted,updateTeacherProfile);
router.post("/:courseId/assign", authorizeRoles("admin", "teacher"), assignCourseValidation, ensureTeacherProfileCompleted, assignCourse);
router.post("/:courseId/unassign", authorizeRoles("admin", "teacher"), unassignCourseValidation, ensureTeacherProfileCompleted, unassignCourse);
router.get("/teach", listTaughtCourses);
router.delete("/:teacherId", authorizeRoles("admin", "teacher"), deleteTeacherProfileValidation, deleteTeacherProfile);

export default router;