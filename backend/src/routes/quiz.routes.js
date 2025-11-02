import express from "express";
import { verifyJWT } from "../middlewares/auth.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";
import {
    createQuiz,
    updateQuiz,
    getQuiz,
    deleteQuiz,
    listQuizzes,
    toggleQuizActive,
    publishQuiz
    // // startQuiz,
    // submitAttempt,
    // getAttempt,
    // listAttempts
} from "../controllers/quiz.controller.js";
import {
    ensureTeacherProfileCompleted
} from "../controllers/teacher.controller.js";

const router = express.Router();

router.use(verifyJWT);

router.post("/", authorizeRoles("teacher", "admin"), ensureTeacherProfileCompleted, createQuiz);
router.patch("/:quizId", authorizeRoles("teacher","admin"), ensureTeacherProfileCompleted, updateQuiz);
router.get("/:quizId", authorizeRoles("teacher","admin"), ensureTeacherProfileCompleted, getQuiz);
router.delete("/:quizId", authorizeRoles("teacher","admin"), ensureTeacherProfileCompleted, deleteQuiz);
router.get("/", listQuizzes);
router.post("/:quizId/toggle", authorizeRoles("teacher","admin"), ensureTeacherProfileCompleted, toggleQuizActive);
router.post("/:quizId/publish", authorizeRoles("teacher","admin"), ensureTeacherProfileCompleted, publishQuiz);
// router.post("/:quizId/start", authorizeRoles("student"), startQuiz);
// router.post("attempts/:quizId/submit", authorizeRoles("student"), submitAttempt);
// router.get("/attempts/:attemptId", getAttempt);
// router.get("/attempts", listAttempts);


export default router;
