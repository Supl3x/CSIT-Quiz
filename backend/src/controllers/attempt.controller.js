import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncWrapper.js";
import { ApiError } from "../utils/errorHandler.js";
import { ApiResponse } from "../utils/response.js";

import Attempt from "../models/attempt.model.js";
import Quiz from "../models/quiz.model.js";
import Question from "../models/question.model.js";
import User from "../models/user.model.js";

const { Types } = mongoose;


const snapshotQuestion = (qDoc) => ({
  questionId: qDoc._id,
  title: qDoc.title,
  description: qDoc.description,
  type: qDoc.type,
  choices: qDoc.choices || [],
  points: qDoc.points || 1,
  difficulty: qDoc.difficulty,
  tags: qDoc.tags || [],
  correctAnswer: qDoc.correctAnswer,
  acceptableAnswers: qDoc.acceptableAnswers,
  // testCases: qDoc.type === "code" ? qDoc.testCases : [],
  requiresManualGrading: qDoc.requiresManualGrading || false,
});

const sanitizeSnapshotForClient = (snapshot) => {
  const copy = snapshot.toObject ? snapshot.toObject() : { ...snapshot };

  delete copy.correctAnswer;
  delete copy.acceptableAnswers;
  
  // Remove or hide test case outputs
  if (Array.isArray(copy.testCases)) {
    copy.testCases = copy.testCases.map((t) => {
      const tcopy = { ...t };
      if (tcopy.hidden) delete tcopy.expectedOutput;
      return tcopy;
    });
  }
  return copy;
};

const startAttempt = asyncHandler(async (req, res) => {
  const actor = req.user;
  if (!actor || actor.role !== "student") throw new ApiError(403, "Only students can start quiz attempts");

  const { quizId } = req.params;
  if (!Types.ObjectId.isValid(quizId)) throw new ApiError(400, "Invalid quiz ID");

  const quiz = await Quiz.findById(quizId).populate("author", "name email role");
  if (!quiz || !quiz.isActive || !quiz.isPublished) throw new ApiError(404, "Quiz not available or not published");

  const existingAttempts = await Attempt.countDocuments({ quiz: quizId, student: actor._id });
  if (!quiz.allowRetake && existingAttempts > 0) {
    throw new ApiError(403, "Retakes are not allowed for this quiz");
  }
  if (quiz.allowRetake && quiz.attemptsAllowed && existingAttempts >= quiz.attemptsAllowed) {
    throw new ApiError(403, "You have reached the maximum number of attempts");
  }

  let questions = [];
  if (quiz.questionPool && quiz.questionPool.length) {
    const ids = quiz.questionPool.map((p) => p.question);
    const found = await Question.find({ _id: { $in: ids }, isActive: true });
    questions = found.map(snapshotQuestion);
  } else if (quiz.generationRules && quiz.generationRules.length) {

    const all = [];
    for (const rule of quiz.generationRules) {
      const q = await Question.aggregate([
        { $match: { isActive: true, difficulty: rule.difficulty, tags: { $in: rule.tags || [] } } },
        { $sample: { size: rule.count || 1 } },
      ]);
      all.push(...q);
    }
    questions = all.map(snapshotQuestion);
  }

  if (!questions.length) throw new ApiError(400, "No questions found for this quiz");

  const attempt = await Attempt.create({
    quiz: quiz._id,
    student: actor._id,
    questions: questions.map((q) => ({
      snapshot: q,
      maxScore: q.points,
      needsManualGrading: q.requiresManualGrading,
    })),
    ipAddress: req.ip,
    userAgent: req.get("User-Agent"),
  });


  const clientQuestions = attempt.questions.map(q => ({
    snapshot: sanitizeSnapshotForClient(q.snapshot), 
    maxScore: q.maxScore
  }));

  // This response now correctly includes questions and duration
  return res
    .status(201)
    .json(new ApiResponse(201, { 
      attemptId: attempt._id, 
      questions: clientQuestions, 
      durationMinutes: quiz.durationMinutes 
    }, "Attempt started successfully"));
});


const submitAttempt = asyncHandler(async (req, res) => {
  const actor = req.user;
  if (!actor || actor.role !== "student") throw new ApiError(403, "Only students can submit attempts");

  const { attemptId } = req.params;
  if (!Types.ObjectId.isValid(attemptId)) throw new ApiError(400, "Invalid attempt ID");

  const attempt = await Attempt.findById(attemptId).populate("quiz");
  if (!attempt) throw new ApiError(404, "Attempt not found");
  if (String(attempt.student) !== String(actor._id)) throw new ApiError(403, "This attempt does not belong to you");
  if (attempt.status === "submitted") throw new ApiError(400, "Attempt already submitted");

  const { answers = [] } = req.body;
  if (!Array.isArray(answers)) throw new ApiError(400, "answers must be an array");

  answers.forEach((ans) => {
    const target = attempt.questions.find((qa) => String(qa.snapshot.questionId) === String(ans.questionId));
    if (target) target.answer = ans.answer || {};
  });

  attempt.computeAutoGrade();

  const categoryScores = {};
  attempt.questions.forEach(qAttempt => {
    const category = (qAttempt.snapshot.tags && qAttempt.snapshot.tags.length > 0)
      ? qAttempt.snapshot.tags[0]
      : 'General';

    if (!categoryScores[category]) {
      categoryScores[category] = { correct: 0, total: 0 };
    }

    categoryScores[category].total++;

    if (qAttempt.autoScore > 0) {
    categoryScores[category].correct++;
    }
  });
  attempt.categoryScores = categoryScores;

  attempt.status = "submitted";
  attempt.submittedAt = new Date();
  attempt.timeTakenSeconds = Math.floor((attempt.submittedAt - attempt.startedAt) / 1000);

  await attempt.save();

  // Return the full attempt object so the frontend can build the results page
  return res
    .status(200)
    .json(new ApiResponse(200, attempt, "Attempt submitted successfully"));
});


const listMyAttempts = asyncHandler(async (req, res) => {
  const actor = req.user;
  if (!actor || actor.role !== "student") throw new ApiError(403, "Only students can view their attempts");

  const attempts = await Attempt.find({ student: actor._id })
    .populate("quiz", "title course durationMinutes")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, { attempts }, "Fetched your quiz attempts"));
});


const getAttempt = asyncHandler(async (req, res) => {
  const actor = req.user;
  const { attemptId } = req.params;
  if (!Types.ObjectId.isValid(attemptId)) throw new ApiError(400, "Invalid attempt ID");

  const attempt = await Attempt.findById(attemptId)
    .populate("student", "name email role")
    .populate("quiz", "title course durationMinutes author");

  if (!attempt) throw new ApiError(404, "Attempt not found");

  const isOwner = String(attempt.student._id) === String(actor._id);
  const isTeacher = actor.role === "teacher" || actor.role === "admin";

  if (!isOwner && !isTeacher) throw new ApiError(403, "Access denied");

  return res.status(200).json(new ApiResponse(200, { attempt }, "Attempt fetched"));
});


const gradeAttempt = asyncHandler(async (req, res) => {
  const actor = req.user;
  if (!["teacher", "admin"].includes(actor.role)) throw new ApiError(403, "Only teachers or admins can grade attempts");

  const { attemptId } = req.params;
  if (!Types.ObjectId.isValid(attemptId)) throw new ApiError(400, "Invalid attempt ID");

  const attempt = await Attempt.findById(attemptId).populate("quiz");
  if (!attempt) throw new ApiError(404, "Attempt not found");

  const { grades = [] } = req.body;
  if (!Array.isArray(grades)) throw new ApiError(400, "grades must be an array");

  let totalManual = 0;
  grades.forEach((g) => {
    const qa = attempt.questions.find((q) => String(q.snapshot.questionId) === String(g.questionId));
    if (qa) {
      qa.manualScore = Math.min(g.score || 0, qa.maxScore);
      qa.graded = true;
      qa.gradedBy = actor._id;
      qa.gradeComment = g.comment || null;
      totalManual += qa.manualScore;
    }
  });

  attempt.totalManualScore = totalManual;
  attempt.totalScore = attempt.totalAutoScore + attempt.totalManualScore;
  await attempt.save();

  return res
    .status(200)
    .json(new ApiResponse(200, { totalScore: attempt.totalScore }, "Attempt graded successfully"));
});

const listQuizAttempts = asyncHandler(async (req, res) => {
  const actor = req.user;
  if (!["teacher", "admin"].includes(actor.role)) throw new ApiError(403, "Only teachers or admins can view quiz attempts");

  const { quizId } = req.params;
  if (!Types.ObjectId.isValid(quizId)) throw new ApiError(400, "Invalid quiz ID");

  const quiz = await Quiz.findById(quizId).select("author");
  if (!quiz) throw new ApiError(404, "Quiz not found");

  const isInstructor =
    actor.role === "admin" ||
    String(quiz.author) === String(actor._id);

  if (!isInstructor) {
    throw new ApiError(403, "You are not authorized to view attempts for this quiz");
  }

  const attempts = await Attempt.find({ quiz: quizId })
    .populate("student", "name email")
    .sort({ createdAt: -1 });

  return res.status(200).json(new ApiResponse(200, { attempts }, "Fetched quiz attempts"));
});


const deleteAttempt = asyncHandler(async (req, res) => {
  const actor = req.user;
  if (actor.role !== "admin") throw new ApiError(403, "Only admins can delete attempts");

  const { attemptId } = req.params;
  if (!Types.ObjectId.isValid(attemptId)) throw new ApiError(400, "Invalid attempt ID");

  await Attempt.findByIdAndDelete(attemptId);
  return res.status(200).json(new ApiResponse(200, {}, "Attempt deleted successfully"));
});

export {
    startAttempt,
    submitAttempt,
    listMyAttempts,
    getAttempt,
    gradeAttempt,
    listQuizAttempts,
    deleteAttempt
}