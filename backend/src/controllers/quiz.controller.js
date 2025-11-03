// src/controllers/quiz.controller.js
import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncWrapper.js";
import { ApiError } from "../utils/errorHandler.js";
import { ApiResponse } from "../utils/response.js";

import Quiz from "../models/quiz.model.js";
import Question from "../models/question.model.js";
import Attempt from "../models/attempt.model.js";
import Course from "../models/course.model.js";
import User from "../models/user.model.js";
import Student from "../models/student.model.js";

const sanitizeQuiz = (quiz) => {
  if (!quiz) return null;
  const obj = quiz.toObject ? quiz.toObject() : { ...quiz };
  delete obj.__v;
  return obj;
};

const sanitizeSnapshotForClient = (snapshot) => {
  const copy = { ...snapshot };
  // Remove answers & hidden test cases
  delete copy.correctAnswer;
  if (Array.isArray(copy.testCases)) {
    copy.testCases = copy.testCases.map((t) => {
      const tcopy = { ...t };
      // hide expectedOutput for hidden testcases
      if (tcopy.hidden) delete tcopy.expectedOutput;
      return tcopy;
    });
  }
  return copy;
};


const populateQuizQuery = (q) =>
  q.populate({
    path: "author",
    model: "User",
    select: "name email avatar role",
  }).populate({
    path: "course",
    model: "Course",
    select: "title code department semester academicYear",
  });


const buildQuestionSnapshot = (questionDoc) => {
  if (!questionDoc) return null;
  return {
    questionId: questionDoc._id,
    title: questionDoc.title,
    description: questionDoc.description,
    type: questionDoc.type,
    choices: (questionDoc.choices || []).map((c) => ({
      _id: c._id,
      text: c.text,
      imageUrl: c.imageUrl || null,
      order: c.order || 0,
    })),
    points: questionDoc.points || 1,
    difficulty: questionDoc.difficulty || "medium",
    testCases: (questionDoc.testCases || []).map((t) => ({
      input: t.input,
      expectedOutput: t.expectedOutput,
      weight: t.weight || 1,
      hidden: !!t.hidden,
    })),
    requiresManualGrading: !!questionDoc.requiresManualGrading,
    // include correctAnswer/acceptableAnswers for server-side grading (do not return to client)
    correctAnswer: questionDoc.correctAnswer || null,
    acceptableAnswers: questionDoc.acceptableAnswers || [],
  };
};


const createQuiz = asyncHandler(async (req, res) => {
  const actor = req.user;
  if (!actor) throw new ApiError(401, "Unauthorized");
  if (!["teacher", "admin"].includes(actor.role)) throw new ApiError(403, "Only teachers or admins can create quizzes");

  const {
    title,
    description,
    course,
    questionPool = [],
    generationRules = [],
    durationMinutes,
    randomizeQuestions = true,
    randomizeOptions = true,
    startTime = null,
    endTime = null,
    allowRetake = false,
    attemptsAllowed = 1,
    autoGrade = true,
    isPublished = false,
    isActive = false,
  } = req.body;

  if (!title) throw new ApiError(400, "Title is required");
  if (!durationMinutes || isNaN(durationMinutes)) throw new ApiError(400, "durationMinutes is required");

  if (course) {
    const c = await Course.findById(course);
    if (!c) throw new ApiError(404, "Course not found");
  }

  const pool = Array.isArray(questionPool)
    ? questionPool.map((p) => ({ question: p.question, weight: Number(p.weight) || 1 }))
    : [];

  const quiz = await Quiz.create({
    title,
    description: description || null,
    author: actor._id,
    course: course || null,
    questionPool: pool,
    generationRules: Array.isArray(generationRules) ? generationRules : [],
    durationMinutes,
    randomizeQuestions,
    randomizeOptions,
    startTime,
    endTime,
    allowRetake,
    attemptsAllowed: Number(attemptsAllowed) || 1,
    autoGrade,
    isPublished,
    isActive,
  });

  const populated = await populateQuizQuery(Quiz.findById(quiz._id));
  return res.status(201).json(new ApiResponse(201, { quiz: sanitizeQuiz(await populated) }, "Quiz created"));
});


const updateQuiz = asyncHandler(async (req, res) => {
  const actor = req.user;
  if (!actor) throw new ApiError(401, "Unauthorized");

  const { quizId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(quizId)) throw new ApiError(400, "Invalid quiz id");

  const quiz = await Quiz.findById(quizId);
  if (!quiz) throw new ApiError(404, "Quiz not found");

  const isAuthor = String(quiz.author) === String(actor._id);
  if (!(actor.role === "admin" || isAuthor)) throw new ApiError(403, "Forbidden");

  const updatable = [
    "title","description","course","questionPool","generationRules",
    "durationMinutes","randomizeQuestions","randomizeOptions",
    "startTime","endTime","allowRetake","attemptsAllowed","autoGrade","isPublished","isActive"
  ];

  const updates = {};
  for (const k of updatable) {
    if (Object.prototype.hasOwnProperty.call(req.body, k)) updates[k] = req.body[k];
  }

  const updated = await Quiz.findByIdAndUpdate(quizId, { $set: updates }, { new: true, runValidators: true });
  const populated = await populateQuizQuery(Quiz.findById(updated._id));
  return res.status(200).json(new ApiResponse(200, { quiz: sanitizeQuiz(await populated) }, "Quiz updated"));
});


const deleteQuiz = asyncHandler(async (req, res) => {
  const actor = req.user;
  if (!actor) throw new ApiError(401, "Unauthorized");
  if(!["teacher", "admin"].includes(actor.role)) throw new ApiError(403, "Only teachers or admins can delete quizzes");

  const { quizId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(quizId)) throw new ApiError(400, "Invalid quiz id");

  const quiz = await Quiz.findById(quizId);
  if (!quiz) throw new ApiError(404, "Quiz not found");

  const isAuthor = String(quiz.author) === String(actor._id);
  if (!(actor.role === "admin" || isAuthor)) throw new ApiError(403, "Forbidden");

  await Quiz.findByIdAndDelete(quizId);

  return res.status(200).json(new ApiResponse(200, {}, "Quiz deleted successfully"));
});


const getQuiz = asyncHandler(async (req, res) => {
  const { quizId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(quizId)) throw new ApiError(400, "Invalid quiz id");

  const includeQuestions = req.query.includeQuestions === "true";

  const q = await populateQuizQuery(Quiz.findById(quizId));
  if (!q) throw new ApiError(404, "Quiz not found");

  const quizObj = sanitizeQuiz(await q);

  if (includeQuestions) {
    const actor = req.user;
    if (!actor) throw new ApiError(401, "Unauthorized");
    const isAuthor = String(quizObj.author._id || quizObj.author) === String(actor._id);
    if (!(actor.role === "admin" || isAuthor)) {
      throw new ApiError(403, "Only the quiz author or admin can fetch questions");
    }

    const questionIds = (quizObj.questionPool || []).map((p) => p.question);
    const questions = await Question.find({ _id: { $in: questionIds } });
    quizObj.questions = questions;
  }

  return res.status(200).json(new ApiResponse(200, { quiz: quizObj }, "Quiz fetched"));
});


const listQuizzes = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, q, course, author, isPublished, isActive, sortBy = "createdAt", sortOrder = "desc" } = req.query;
  const filter = {};
  if (course) filter.course = course;
  if (author) filter.author = author;
  if (typeof isPublished !== "undefined") filter.isPublished = isPublished === "true";
  if (typeof isActive !== "undefined") filter.isActive = isActive === "true";
  if (q) filter.$text = { $search: q };

  const query = Quiz.find(filter);
  const sort = {};
  sort[sortBy] = sortOrder === "asc" ? 1 : -1;

  const pageNum = Math.max(parseInt(page, 10), 1);
  const pageSize = Math.max(Math.min(parseInt(limit, 10), 200), 1);

  const [total, quizzes] = await Promise.all([
    Quiz.countDocuments(query.getQuery()),
    populateQuizQuery(query.sort(sort).skip((pageNum - 1) * pageSize).limit(pageSize)),
  ]);

  const result = (await quizzes).map(sanitizeQuiz);
  return res.status(200).json(new ApiResponse(200, { meta: { total, page: pageNum, limit: pageSize }, quizzes: result }, "Quizzes listed"));
});

const toggleQuizActive = asyncHandler(async (req, res) => {
  const actor = req.user;
  if(!actor) throw new ApiError(401, "Unauthorized");
  if (!["teacher", "admin"].includes(actor.role)) throw new ApiError(403, "Only teachers or admins can create quizzes");

  const { quizId } = req.params;
  if(!quizId || !mongoose.Types.ObjectId.isValid(quizId)) throw new ApiError(400, "Invalid quiz id");

  const populatedQuiz = await populateQuizQuery(Quiz.findById(quizId));
  if (!populatedQuiz) throw new ApiError(404, "Quiz not found");

  populatedQuiz.isActive = !populatedQuiz.isActive;
  await populatedQuiz.save();

  return res.status(200).json(new ApiResponse(200, { quiz: sanitizeQuiz(await populatedQuiz) }, "Quiz status toggled"));
})

const publishQuiz = asyncHandler(async (req, res) => {
  const actor = req.user;
  if (!actor) throw new ApiError(401, "Unauthorized");
  if (!["teacher", "admin"].includes(actor.role)) throw new ApiError(403, "Only teachers or admins can publish quizzes");

  const { quizId } = req.params;
  if (!quizId || !mongoose.Types.ObjectId.isValid(quizId)) throw new ApiError(400, "Invalid quiz id");

  const populatedQuiz = await populateQuizQuery(Quiz.findById(quizId));
  if (!populatedQuiz) throw new ApiError(404, "Quiz not found");
  populatedQuiz.isPublished = true;
  await populatedQuiz.save();

  return res.status(200).json(new ApiResponse(200, { quiz: sanitizeQuiz(await populatedQuiz) }, "Quiz published"));
})


// // const startQuiz = asyncHandler(async (req, res) => {
// //   const actor = req.user;
// //   if (!actor) throw new ApiError(401, "Unauthorized");
// //   if (actor.role !== "student") throw new ApiError(403, "Only students can start quiz attempts");

// //   const { quizId } = req.params;
// //   if (!mongoose.Types.ObjectId.isValid(quizId)) throw new ApiError(400, "Invalid quiz id");

// //   const quiz = await Quiz.findById(quizId);
// //   if (!quiz || !quiz.isActive) throw new ApiError(404, "Quiz not found or inactive");
// //   if (!quiz.isPublished) throw new ApiError(403, "Quiz is not published yet");

// //   // time window checks
// //   const now = new Date();
// //   if (quiz.startTime && now < new Date(quiz.startTime)) throw new ApiError(403, "Quiz not yet started");
// //   if (quiz.endTime && now > new Date(quiz.endTime)) throw new ApiError(403, "Quiz has ended");

// //   // check student profile
// //   const studentProfile = await Student.findOne({ student: actor._id });
// //   if (!studentProfile) throw new ApiError(403, "Student profile required to start quiz");

// //   // check attempts allowed
// //   const pastAttemptsCount = await Attempt.countDocuments({ quiz: quiz._id, student: actor._id, status: { $in: ["submitted","auto-submitted"] } });
// //   if (!quiz.allowRetake && pastAttemptsCount >= (quiz.attemptsAllowed || 1)) {
// //     throw new ApiError(403, "No attempts left for this quiz");
// //   }

// //   // Generate question set: from questionPool OR generationRules
// //   let selectedQuestions = [];

// //   if (Array.isArray(quiz.questionPool) && quiz.questionPool.length > 0) {
// //     // expand pool items -> { question, weight }. We'll select all provided questions but can randomize order
// //     selectedQuestions = quiz.questionPool.map((p) => ({ id: p.question, weight: p.weight || 1 }));
// //     // if randomizeQuestions true, shuffle selectedQuestions
// //     if (quiz.randomizeQuestions) {
// //       for (let i = selectedQuestions.length - 1; i > 0; i--) {
// //         const j = Math.floor(Math.random() * (i + 1));
// //         [selectedQuestions[i], selectedQuestions[j]] = [selectedQuestions[j], selectedQuestions[i]];
// //       }
// //     }
// //   } else if (Array.isArray(quiz.generationRules) && quiz.generationRules.length > 0) {
// //     // For each rule, match questions by tags/difficulty and sample count
// //     for (const rule of quiz.generationRules) {
// //       const match = {};
// //       if (Array.isArray(rule.tags) && rule.tags.length) match.tags = { $in: rule.tags };
// //       if (rule.difficulty) match.difficulty = rule.difficulty;
// //       // Only active questions
// //       match.isActive = true;

// //       const count = Math.max(parseInt(rule.count || 0, 10), 0);
// //       if (count <= 0) continue;

// //       // Use aggregation to sample if available
// //       const pipeline = [{ $match: match }, { $sample: { size: count } }];
// //       const docs = await Question.aggregate(pipeline).exec();
// //       selectedQuestions.push(...docs.map((d) => ({ id: d._id, weight: d.points || 1 })));
// //     }

// //     // If randomizeQuestions is true, shuffle overall selectedQuestions
// //     if (quiz.randomizeQuestions) {
// //       for (let i = selectedQuestions.length - 1; i > 0; i--) {
// //         const j = Math.floor(Math.random() * (i + 1));
// //         [selectedQuestions[i], selectedQuestions[j]] = [selectedQuestions[j], selectedQuestions[i]];
// //       }
// //     }
// //   } else {
// //     throw new ApiError(400, "Quiz contains no questionPool or generationRules");
// //   }

// //   // fetch question docs
// //   const questionIds = selectedQuestions.map((s) => s.id);
// //   const questionDocs = await Question.find({ _id: { $in: questionIds }, isActive: true });

// //   // Reorder questions according to selectedQuestions order and build snapshots
// //   const questionMap = new Map(questionDocs.map((q) => [String(q._id), q]));
// //   const snapshots = [];
// //   for (const s of selectedQuestions) {
// //     const qDoc = questionMap.get(String(s.id));
// //     if (!qDoc) continue; // skip if missing
// //     const snapshot = buildQuestionSnapshot(qDoc);
// //     snapshot.points = s.weight || snapshot.points || 1;
// //     snapshots.push({
// //       snapshot,
// //       answer: {}, // empty student answer place
// //       autoScore: 0,
// //       manualScore: 0,
// //       maxScore: snapshot.points || 1,
// //       graded: false,
// //       needsManualGrading: !!snapshot.requiresManualGrading,
// //     });
// //   }

// //   if (!snapshots.length) throw new ApiError(400, "No valid questions available for this quiz");

// //   // compute total max points
// //   const maxScore = snapshots.reduce((acc, s) => acc + (s.maxScore || 0), 0);

// //   // Create Attempt document
// //   const attempt = await Attempt.create({
// //     quiz: quiz._id,
// //     student: actor._id,
// //     startedAt: new Date(),
// //     submittedAt: null,
// //     status: "in-progress",
// //     questions: snapshots,
// //     totalAutoScore: 0,
// //     totalManualScore: 0,
// //     totalScore: 0,
// //     maxScore,
// //     timeTakenSeconds: 0,
// //     proctorEvents: [],
// //   });

// //   // Return attempt id and sanitized questions (strip correctAnswer / hidden expectedOutput)
// //   const clientQuestions = attempt.questions.map((qAtt) => {
// //     const s = qAtt.snapshot;
// //     const sanitized = sanitizeSnapshotForClient(s);
// //     // Also remove test case expectedOutput entirely for non-code question types to avoid leakage
// //     if (s.type !== "code") {
// //       sanitized.testCases = (sanitized.testCases || []).map((t) => {
// //         const tc = { input: t.input, weight: t.weight || 1 };
// //         if (!t.hidden) tc.expectedOutput = t.expectedOutput;
// //         return tc;
// //       });
// //     }
// //     return {
// //       questionAttemptId: qAtt._id,
// //       snapshot: sanitized,
// //       answer: qAtt.answer || {},
// //       maxScore: qAtt.maxScore,
// //     };
// //   });

// //   return res.status(201).json(
// //     new ApiResponse(201, {
// //       attemptId: attempt._id,
// //       quizId: quiz._id,
// //       durationMinutes: quiz.durationMinutes,
// //       startedAt: attempt.startedAt,
// //       questions: clientQuestions,
// //       maxScore,
// //     }, "Quiz attempt created")
// //   );
// // });


// // const submitAttempt = asyncHandler(async (req, res) => {
// //   const actor = req.user;
// //   if (!actor) throw new ApiError(401, "Unauthorized");
// //   if (actor.role !== "student") throw new ApiError(403, "Only students can submit attempts");

// //   const { attemptId } = req.params;
// //   if (!mongoose.Types.ObjectId.isValid(attemptId)) throw new ApiError(400, "Invalid attempt id");

// //   const attempt = await Attempt.findById(attemptId);
// //   if (!attempt) throw new ApiError(404, "Attempt not found");
// //   if (String(attempt.student) !== String(actor._id)) throw new ApiError(403, "You may only submit your own attempts");
// //   if (!["in-progress"].includes(attempt.status)) throw new ApiError(400, "Attempt already submitted");

// //   // Expect answers in req.body.answers keyed by snapshot.questionId or questionAttemptId
// //   const answersPayload = req.body.answers || [];

// //   // Apply answers to attempt.questions
// //   // Support two forms: [{ questionAttemptId, answer: {...} }] or [{ questionId, answer: {...} }]
// //   const mapByQAttemptId = new Map(attempt.questions.map((qa) => [String(qa._id), qa]));
// //   const mapByQuestionId = new Map(attempt.questions.map((qa) => [String(qa.snapshot.questionId), qa]));

// //   for (const entry of answersPayload) {
// //     if (!entry) continue;
// //     let target = null;
// //     if (entry.questionAttemptId && mapByQAttemptId.has(String(entry.questionAttemptId))) {
// //       target = mapByQAttemptId.get(String(entry.questionAttemptId));
// //     } else if (entry.questionId && mapByQuestionId.has(String(entry.questionId))) {
// //       target = mapByQuestionId.get(String(entry.questionId));
// //     }
// //     if (!target) continue;
// //     // Only allow certain fields in answer (as in Attempt model)
// //     const allowedAnswer = {};
// //     const a = entry.answer || {};
// //     if (a.selectedChoice) allowedAnswer.selectedChoice = a.selectedChoice;
// //     if (Array.isArray(a.selectedChoices)) allowedAnswer.selectedChoices = a.selectedChoices;
// //     if (typeof a.text === "string") allowedAnswer.text = a.text;
// //     if (Array.isArray(a.fileUrls)) allowedAnswer.fileUrls = a.fileUrls;
// //     if (a.code && typeof a.code === "object") allowedAnswer.code = a.code;
// //     if (Array.isArray(a.mapping)) allowedAnswer.mapping = a.mapping;
// //     if (Array.isArray(a.blanks)) allowedAnswer.blanks = a.blanks;
// //     if (a.raw) allowedAnswer.raw = a.raw;

// //     target.answer = allowedAnswer;
// //   }

// //   // finalize attempt
// //   attempt.submittedAt = new Date();
// //   attempt.timeTakenSeconds = Math.round((attempt.submittedAt - attempt.startedAt) / 1000);
// //   attempt.status = "submitted";

// //   // compute auto grade (using AttemptSchema.methods.computeAutoGrade)
// //   attempt.computeAutoGrade();

// //   // mark totalScore = auto + manual
// //   attempt.totalScore = Math.round((attempt.totalAutoScore + (attempt.totalManualScore || 0)) * 100) / 100;

// //   await attempt.save();

// //   // prepare result to return (do not expose snapshot.correctAnswer etc.)
// //   const resultQuestions = attempt.questions.map((qa) => {
// //     const s = qa.snapshot;
// //     const clientSnapshot = sanitizeSnapshotForClient(s);
// //     return {
// //       questionAttemptId: qa._id,
// //       snapshot: clientSnapshot,
// //       answer: qa.answer,
// //       autoScore: qa.autoScore,
// //       manualScore: qa.manualScore,
// //       maxScore: qa.maxScore,
// //       graded: qa.graded,
// //       needsManualGrading: qa.needsManualGrading,
// //       gradeComment: qa.gradeComment || null,
// //     };
// //   });

// //   return res.status(200).json(new ApiResponse(200, {
// //     attemptId: attempt._id,
// //     quiz: attempt.quiz,
// //     student: attempt.student,
// //     totalAutoScore: attempt.totalAutoScore,
// //     totalManualScore: attempt.totalManualScore,
// //     totalScore: attempt.totalScore,
// //     maxScore: attempt.maxScore,
// //     questions: resultQuestions,
// //     submittedAt: attempt.submittedAt,
// //   }, "Attempt submitted and graded (auto)"));
// // });


// const getAttempt = asyncHandler(async (req, res) => {
//   const actor = req.user;
//   if (!actor) throw new ApiError(401, "Unauthorized");

//   const { attemptId } = req.params;
//   if (!mongoose.Types.ObjectId.isValid(attemptId)) throw new ApiError(400, "Invalid attempt id");

//   const attempt = await Attempt.findById(attemptId)
//     .populate({ path: "student", model: "User", select: "name email avatar" })
//     .populate({ path: "quiz", model: "Quiz", select: "title author" });

//   if (!attempt) throw new ApiError(404, "Attempt not found");

//   // student can view own attempt; teacher/admin can view if teacher is the quiz author or admin
//   if (actor.role === "student" && String(attempt.student._id || attempt.student) !== String(actor._id)) {
//     throw new ApiError(403, "Forbidden");
//   }

//   if (actor.role === "teacher") {
//     // check if actor authored the quiz
//     const quiz = await Quiz.findById(attempt.quiz).select("author");
//     if (!quiz) throw new ApiError(404, "Quiz not found");
//     if (String(quiz.author) !== String(actor._id) && actor.role !== "admin") {
//       throw new ApiError(403, "Teachers can only view attempts for their own quizzes");
//     }
//   }

//   // prepare safe attempt object: remove correctAnswer/hidden outputs
//   const safeQuestions = attempt.questions.map((qa) => {
//     const s = qa.snapshot;
//     return {
//       questionAttemptId: qa._id,
//       snapshot: sanitizeSnapshotForClient(s),
//       answer: qa.answer,
//       autoScore: qa.autoScore,
//       manualScore: qa.manualScore,
//       maxScore: qa.maxScore,
//       graded: qa.graded,
//       needsManualGrading: qa.needsManualGrading,
//       gradeComment: qa.gradeComment,
//     };
//   });

//   return res.status(200).json(new ApiResponse(200, {
//     attemptId: attempt._id,
//     quiz: attempt.quiz,
//     student: attempt.student,
//     status: attempt.status,
//     totalAutoScore: attempt.totalAutoScore,
//     totalManualScore: attempt.totalManualScore,
//     totalScore: attempt.totalScore,
//     maxScore: attempt.maxScore,
//     questions: safeQuestions,
//     startedAt: attempt.startedAt,
//     submittedAt: attempt.submittedAt,
//   }, "Attempt fetched"));
// });


// const listAttempts = asyncHandler(async (req, res) => {
//   const actor = req.user;
//   if (!actor) throw new ApiError(401, "Unauthorized");

//   const { quizId, studentId, page = 1, limit = 20 } = req.query;
//   const filter = {};
//   if (quizId) filter.quiz = quizId;
//   if (studentId) filter.student = studentId;

//   // If teacher, restrict to quizzes where they are author
//   if (actor.role === "teacher") {
//     if (quizId) {
//       const quiz = await Quiz.findById(quizId).select("author");
//       if (!quiz) throw new ApiError(404, "Quiz not found");
//       if (String(quiz.author) !== String(actor._id)) throw new ApiError(403, "Forbidden");
//     } else {
//       // find quizzes authored by teacher and limit attempts to those quizzes
//       const authored = await Quiz.find({ author: actor._id }).select("_id");
//       filter.quiz = { $in: authored.map((q) => q._id) };
//     }
//   }

//   // If student, restrict to own attempts
//   if (actor.role === "student") {
//     filter.student = actor._id;
//   }

//   const pageNum = Math.max(parseInt(page, 10), 1);
//   const pageSize = Math.max(Math.min(parseInt(limit, 10), 200), 1);

//   const query = Attempt.find(filter)
//     .populate({ path: "student", model: "User", select: "name email" })
//     .populate({ path: "quiz", model: "Quiz", select: "title author" })
//     .sort({ createdAt: -1 })
//     .skip((pageNum - 1) * pageSize)
//     .limit(pageSize);

//   const [total, attempts] = await Promise.all([Attempt.countDocuments(filter), query.exec()]);

//   const results = attempts.map((a) => ({
//     attemptId: a._id,
//     quiz: a.quiz,
//     student: a.student,
//     status: a.status,
//     totalScore: a.totalScore,
//     maxScore: a.maxScore,
//     startedAt: a.startedAt,
//     submittedAt: a.submittedAt,
//   }));

//   return res.status(200).json(new ApiResponse(200, { meta: { total, page: pageNum, limit: pageSize }, attempts: results }, "Attempts listed"));
// });


export {
    createQuiz,
    updateQuiz,
    getQuiz,
    deleteQuiz,
    listQuizzes,
    toggleQuizActive,
    publishQuiz,
    // startQuiz,
    // submitAttempt,
    // getAttempt,
    // listAttempts
}