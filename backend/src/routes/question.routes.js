import express from "express";
import { verifyJWT } from "../middlewares/auth.js";
import upload from "../middlewares/multer.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";
import {
  createQuestion,
  updateQuestion,
  getQuestion,
  listQuestions,
  deleteQuestion,
  restoreQuestion,
  addChoice,
  removeChoice,
  // addTestCase,
  // removeTestCase,
  bulkCreateQuestions,
  assignQuestionsToCourse,
  removeQuestionsFromCourse,
  listCourseQuestions,
  assignQuestionsByTagToCourse,
  listQuestionsByTag,
} from "../controllers/questions.controller.js";
import { ensureTeacherProfileCompleted } from "../controllers/teacher.controller.js";

const router = express.Router();

router.use(verifyJWT)

router.post("/", authorizeRoles("teacher"), ensureTeacherProfileCompleted, createQuestion);
router.post("/bulk", authorizeRoles("teacher"),ensureTeacherProfileCompleted,bulkCreateQuestions);
router.patch("/:questionId", authorizeRoles("teacher"), ensureTeacherProfileCompleted,  updateQuestion);
router.get("/", listQuestions);
router.get("/:questionId", authorizeRoles("teacher"), ensureTeacherProfileCompleted, getQuestion);
router.delete("/:questionId", authorizeRoles("teacher"), ensureTeacherProfileCompleted, deleteQuestion);
router.patch("/:questionId/restore", authorizeRoles("teacher"), ensureTeacherProfileCompleted, restoreQuestion);
router.post("/:questionId/choices", authorizeRoles("teacher"), ensureTeacherProfileCompleted, addChoice);
router.delete("/:questionId/choices/:choiceId", authorizeRoles("teacher"), ensureTeacherProfileCompleted, removeChoice);
// router.post("/:questionId/testcases", authorizeRoles("teacher"), ensureTeacherProfileCompleted, addTestCase);
// router.delete("/:questionId/testcases/:tcId", authorizeRoles("teacher"),ensureTeacherProfileCompleted,removeTestCase);
router.post("/course/:courseId/assign", authorizeRoles("teacher"), ensureTeacherProfileCompleted, assignQuestionsToCourse);
router.post("/course/:courseId/remove", authorizeRoles("teacher"), ensureTeacherProfileCompleted, removeQuestionsFromCourse);
router.get("/course/:courseId/questions", authorizeRoles("teacher"), ensureTeacherProfileCompleted, listCourseQuestions);
router.post("/course/:courseId/assignByTag", authorizeRoles("teacher"), ensureTeacherProfileCompleted, assignQuestionsByTagToCourse);
router.post("/by-tag", authorizeRoles("teacher"), ensureTeacherProfileCompleted, listQuestionsByTag);


export default router;
