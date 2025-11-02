import express from "express"
import {
  createCourse,
  getCourse,
  updateCourse,
  toggleCourseActive,
  deleteCourse,
  assignInstructor,
  unassignInstructor,
  listCourses,
  ensureCourseExists
} from "../controllers/course.controller.js";
import { verifyJWT } from "../middlewares/auth.js";


const router = express.Router();
router.use(verifyJWT);

router.post("/", createCourse);
router.get("/:courseId", ensureCourseExists,getCourse);
router.patch("/:courseId", ensureCourseExists, updateCourse);
router.patch("/:courseId/toggle", ensureCourseExists, toggleCourseActive);
router.delete("/:courseId", ensureCourseExists, deleteCourse);
router.patch("/:courseId/assign", ensureCourseExists, assignInstructor);
router.patch("/:courseId/unassign", ensureCourseExists, unassignInstructor);
router.get("/", listCourses);

export default router;