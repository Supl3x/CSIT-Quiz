import express from "express";
import { verifyJWT } from "../middlewares/auth.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";
import {
    startAttempt,
    submitAttempt,
    listMyAttempts,
    getAttempt,
    gradeAttempt,
    listQuizAttempts,
    deleteAttempt
} from "../controllers/attempt.controller.js";
import { ensureStudentProfileCompleted } from "../controllers/student.controller.js";
import { ensureTeacherProfileCompleted } from "../controllers/teacher.controller.js";

const router = express.Router();

router.use(verifyJWT);

router.post("/:quizId/start",  authorizeRoles("student"), ensureStudentProfileCompleted, startAttempt);
router.post("/:attemptId/submit", authorizeRoles("student"), ensureStudentProfileCompleted, submitAttempt);
router.get("/", authorizeRoles("student"), ensureStudentProfileCompleted, listMyAttempts);
router.get("/:attemptId", ensureStudentProfileCompleted, getAttempt);
router.put("/:attemptId", authorizeRoles("teacher", "admin"), ensureTeacherProfileCompleted, gradeAttempt);
router.get("/:quizId/attempts", authorizeRoles("teacher", "admin"), ensureTeacherProfileCompleted, listQuizAttempts);
router.delete("/:attemptId", authorizeRoles("admin"), deleteAttempt);

export default router;