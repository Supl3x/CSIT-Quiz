// src/controllers/questions.controller.js
import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncWrapper.js";
import { ApiError } from "../utils/errorHandler.js";
import { ApiResponse } from "../utils/response.js";

import Question from "../models/question.model.js";
import User from "../models/user.model.js";
import Course from "../models/course.model.js"; // optional linking in future

const { Types } = mongoose;



const sanitizeQuestionForClient = (questionDoc, actor = null) => {
  // actor: current user (populated) - if actor is author or admin, include answers/testcases
  if (!questionDoc) return null;
  const q = questionDoc.toObject ? questionDoc.toObject() : { ...questionDoc };

  // Remove Mongoose internals
  delete q.__v;

  const isAuthorOrAdmin =
    actor && (actor.role === "admin" || String(q.author) === String(actor._id));

  // always remove `correctAnswer` for non author/admin
  if (!isAuthorOrAdmin) {
    delete q.correctAnswer;
    delete q.acceptableAnswers;
    // hide expectedOutput for hidden testcases and remove expectedOutput for non-code types
    if (Array.isArray(q.testCases)) {
      q.testCases = q.testCases.map((t) => {
        const copy = { input: t.input, weight: t.weight || 1, hidden: !!t.hidden };
        if (!t.hidden && q.type === "code") copy.expectedOutput = t.expectedOutput;
        return copy;
      });
    }
  } else {
    // for author/admin keep everything but don't leak hidden expectedOutputs to clients inadvertently
    if (Array.isArray(q.testCases)) {
      q.testCases = q.testCases.map((t) => ({ ...t }));
    }
  }

  return q;
};

const populateAuthor = (q) =>
  q.populate({
    path: "author",
    model: "User",
    select: "name email avatar role",
  });


const createQuestion = asyncHandler(async (req, res) => {
  const actor = req.user;
  if (!actor) throw new ApiError(401, "Unauthorized");
  if (!["teacher", "admin"].includes(actor.role))
    throw new ApiError(403, "Only teachers or admins can create questions");

  const {
    title,
    description = null,
    type,
    choices = [],
    correctAnswer = null,
    acceptableAnswers = [],
    testCases = [],
    points = 1,
    difficulty = "medium",
    tags = [],
    requiresManualGrading = false,
    attachments = [],
  } = req.body;

  if (!title || !type) throw new ApiError(400, "title and type are required");

  const allowedTypes = [
    "mcq",
    "checkbox",
    "short_answer",
    "long_answer",
    "code",
    "drag_drop",
    "match",
    "fill_blank",
    "file_upload",
    "true_false"
  ];
  if (!allowedTypes.includes(type)) throw new ApiError(400, "Invalid question type");

  let normalizedChoices = [];
  let normalizedTestCases = [];

  if (["mcq", "checkbox", "drag_drop"].includes(type)) {
    normalizedChoices = Array.isArray(choices)
      ? choices.map((c, idx) => ({
          _id: c._id ? (Types.ObjectId.isValid(c._id) ? c._id : undefined) : undefined,
          text: (c.text || "").trim(),
          imageUrl: c.imageUrl || null,
          order: typeof c.order === "number" ? c.order : idx,
        }))
      : [];
  }

  if (type === "code") {
  normalizedTestCases = Array.isArray(testCases)
    ? testCases.map((t) => ({
        input: t.input || "",
        expectedOutput: t.expectedOutput || "",
        weight: typeof t.weight === "number" ? t.weight : 1,
        hidden: !!t.hidden,
      }))
    : [];
  }

  let tfCorrectAnswer = null;
  if (type === "true_false") {
    if (typeof correctAnswer !== "boolean")
      throw new ApiError(400, "For true/false questions, correctAnswer must be true or false");
    tfCorrectAnswer = correctAnswer;
  }

  const question = await Question.create({
    title: title.trim(),
    description,
    type,
    choices: normalizedChoices,
    correctAnswer: type === "true_false" ? tfCorrectAnswer : correctAnswer || null,
    acceptableAnswers: Array.isArray(acceptableAnswers) ? acceptableAnswers : [],
    testCases: normalizedTestCases,
    points: Number(points) || 1,
    difficulty,
    tags: Array.isArray(tags) ? tags : [],
    author: actor._id,
    attachments: Array.isArray(attachments) ? attachments : [],
    isActive: true,
    requiresManualGrading: !!requiresManualGrading,
  });

  const populated = await populateAuthor(Question.findById(question._id));
  return res
    .status(201)
    .json(new ApiResponse(201, { question: sanitizeQuestionForClient(await populated, actor) }, "Question created"));
});


const updateQuestion = asyncHandler(async (req, res) => {
  const actor = req.user;
  if (!actor) throw new ApiError(401, "Unauthorized");

  const { questionId } = req.params;
  if (!Types.ObjectId.isValid(questionId)) throw new ApiError(400, "Invalid question id");

  const q = await Question.findById(questionId);
  if (!q) throw new ApiError(404, "Question not found");

  const isAuthor = String(q.author) === String(actor._id);
  if (!(actor.role === "admin" || isAuthor)) throw new ApiError(403, "Only author or admin can update the question");

  const allowed = [
    "title",
    "description",
    "type",
    "choices",
    "correctAnswer",
    "acceptableAnswers",
    "testCases",
    "points",
    "difficulty",
    "tags",
    "requiresManualGrading",
    "attachments",
    "isActive",
  ];

  const updates = {};
  for (const key of allowed) {
    if (Object.prototype.hasOwnProperty.call(req.body, key)) updates[key] = req.body[key];
  }

  // if (updates.type && updates.type !== q.type) {
  // }

  if (Array.isArray(updates.choices)) {
    updates.choices = updates.choices.map((c, idx) => ({
      _id: c._id ? (Types.ObjectId.isValid(c._id) ? c._id : undefined) : undefined,
      text: (c.text || "").trim(),
      imageUrl: c.imageUrl || null,
      order: typeof c.order === "number" ? c.order : idx,
    }));
  }

  if (Array.isArray(updates.testCases)) {
    updates.testCases = updates.testCases.map((t) => ({
      input: t.input || "",
      expectedOutput: t.expectedOutput || "",
      weight: typeof t.weight === "number" ? t.weight : 1,
      hidden: !!t.hidden,
    }));
  }


  if (updates.type === "true_false") {
    if (typeof updates.correctAnswer !== "boolean") {
      throw new ApiError(400, "For true/false questions, correctAnswer must be true or false");
    }
    updates.choices = [];
    updates.testCases = [];
  }
  const updated = await Question.findByIdAndUpdate(questionId, { $set: updates }, { new: true, runValidators: true });
  const populated = await populateAuthor(Question.findById(updated._id));
  return res.status(200).json(new ApiResponse(200, { question: sanitizeQuestionForClient(await populated, actor) }, "Question updated"));
});


const getQuestion = asyncHandler(async (req, res) => {
  const actor = req.user; // may be null for public endpoints
  const { questionId } = req.params;
  if (!Types.ObjectId.isValid(questionId)) throw new ApiError(400, "Invalid question id");

  const qQuery = populateAuthor(Question.findById(questionId));
  const question = await qQuery;
  if (!question) throw new ApiError(404, "Question not found");

  const includeAnswers = req.query.includeAnswers === "true";

  if (includeAnswers && !(actor && (actor.role === "admin" || String(question.author) === String(actor._id)))) {
    throw new ApiError(403, "Only author or admin can include answers/testcases");
  }

  return res.status(200).json(new ApiResponse(200, { question: sanitizeQuestionForClient(question, actor) }, "Question fetched"));
});


const listQuestions = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    q,
    tags,
    difficulty,
    author,
    isActive,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;

  const filter = {};
  if (typeof isActive !== "undefined") filter.isActive = isActive === "true";
  if (difficulty) filter.difficulty = difficulty;
  if (author) filter.author = author;
  if (tags) {
    const tagsArr = String(tags).split(",").map((t) => t.trim()).filter(Boolean);
    if (tagsArr.length) filter.tags = { $in: tagsArr };
  }
  if (q) filter.$text = { $search: q };

  const query = Question.find(filter);
  const sort = {};
  sort[sortBy] = sortOrder === "asc" ? 1 : -1;

  const pageNum = Math.max(parseInt(page, 10), 1);
  const pageSize = Math.max(Math.min(parseInt(limit, 10), 200), 1);

  const [total, questions] = await Promise.all([
    Question.countDocuments(query.getQuery()),
    populateAuthor(query.sort(sort).skip((pageNum - 1) * pageSize).limit(pageSize)),
  ]);

  const actor = req.user;
  const result = (await questions).map((qDoc) => sanitizeQuestionForClient(qDoc, actor));

  return res.status(200).json(new ApiResponse(200, { meta: { total, page: pageNum, limit: pageSize }, questions: result }, "Questions listed"));
});


const deleteQuestion = asyncHandler(async (req, res) => {
  const actor = req.user;
  if (!actor) throw new ApiError(401, "Unauthorized");

  const { questionId } = req.params;
  if (!Types.ObjectId.isValid(questionId)) throw new ApiError(400, "Invalid question id");

  const q = await Question.findById(questionId);
  if (!q) throw new ApiError(404, "Question not found");

  const isAuthor = String(q.author) === String(actor._id);
  if (!(actor.role === "admin" || isAuthor)) throw new ApiError(403, "Only author or admin can delete the question");

  q.isActive = false;
  await q.save();

  return res.status(200).json(new ApiResponse(200, {}, "Question archived (isActive=false)"));
});


const restoreQuestion = asyncHandler(async (req, res) => {
  const actor = req.user;
  if (!actor) throw new ApiError(401, "Unauthorized");

  const { questionId } = req.params;
  if (!Types.ObjectId.isValid(questionId)) throw new ApiError(400, "Invalid question id");

  const q = await Question.findById(questionId);
  if (!q) throw new ApiError(404, "Question not found");

  const isAuthor = String(q.author) === String(actor._id);
  if (!(actor.role === "admin" || isAuthor)) throw new ApiError(403, "Only author or admin can restore the question");

  q.isActive = true;
  await q.save();

  const populated = await populateAuthor(Question.findById(q._id));
  return res.status(200).json(new ApiResponse(200, { question: sanitizeQuestionForClient(await populated, actor) }, "Question restored"));
});


const addChoice = asyncHandler(async (req, res) => {
  const actor = req.user;
  if (!actor) throw new ApiError(401, "Unauthorized");

  const { questionId } = req.params;
  if (!Types.ObjectId.isValid(questionId)) throw new ApiError(400, "Invalid question id");

  const q = await Question.findById(questionId);
  if (!q) throw new ApiError(404, "Question not found");

  if (!["mcq", "checkbox", "drag_drop"].includes(q.type)) {
    throw new ApiError(400, `Choices are not valid for question type "${q.type}"`);
  }

  const isAuthor = String(q.author) === String(actor._id);
  if (!(actor.role === "admin" || isAuthor)) throw new ApiError(403, "Only author or admin can add choices");

  const { text = "", imageUrl = null, order = q.choices.length } = req.body;

  q.choices.push({ text: String(text).trim(), imageUrl, order: Number(order) });
  await q.save();

  const populated = await populateAuthor(Question.findById(q._id));
  return res.status(201).json(new ApiResponse(201, { question: sanitizeQuestionForClient(await populated, actor) }, "Choice added"));
});


const removeChoice = asyncHandler(async (req, res) => {
  const actor = req.user;
  if (!actor) throw new ApiError(401, "Unauthorized");
  const { questionId, choiceId } = req.params;
  if (!Types.ObjectId.isValid(questionId) || !Types.ObjectId.isValid(choiceId)) throw new ApiError(400, "Invalid id(s)");

  const q = await Question.findById(questionId);
  if (!q) throw new ApiError(404, "Question not found");

  const isAuthor = String(q.author) === String(actor._id);
  if (!(actor.role === "admin" || isAuthor)) throw new ApiError(403, "Only author or admin can remove choices");

  const idx = q.choices.findIndex((c) => String(c._id) === String(choiceId));
  if (idx === -1) throw new ApiError(404, "Choice not found");

  q.choices.splice(idx, 1);
  await q.save();

  const populated = await populateAuthor(Question.findById(q._id));
  return res.status(200).json(new ApiResponse(200, { question: sanitizeQuestionForClient(await populated, actor) }, "Choice removed"));
});


const addTestCase = asyncHandler(async (req, res) => {
  const actor = req.user;
  if (!actor) throw new ApiError(401, "Unauthorized");
  const { questionId } = req.params;
  if (!Types.ObjectId.isValid(questionId)) throw new ApiError(400, "Invalid question id");

  const q = await Question.findById(questionId);
  if (!q) throw new ApiError(404, "Question not found");
  if (q.type !== "code") throw new ApiError(400, "Testcases only valid for code questions");

  const isAuthor = String(q.author) === String(actor._id);
  if (!(actor.role === "admin" || isAuthor)) throw new ApiError(403, "Only author or admin can add testcases");

  const { input = "", expectedOutput = "", weight = 1, hidden = false } = req.body;
  q.testCases.push({ input: String(input), expectedOutput: String(expectedOutput), weight: Number(weight) || 1, hidden: !!hidden });
  await q.save();

  const populated = await populateAuthor(Question.findById(q._id));
  return res.status(201).json(new ApiResponse(201, { question: sanitizeQuestionForClient(await populated, actor) }, "Testcase added"));
});


const removeTestCase = asyncHandler(async (req, res) => {
  const actor = req.user;
  if (!actor) throw new ApiError(401, "Unauthorized");
  const { questionId, tcId } = req.params;

  if (!Types.ObjectId.isValid(questionId)) throw new ApiError(400, "Invalid question id");
  const q = await Question.findById(questionId);
  if (!q) throw new ApiError(404, "Question not found");
  if (q.type !== "code") throw new ApiError(400, "Testcases only valid for code questions");

  const isAuthor = String(q.author) === String(actor._id);
  if (!(actor.role === "admin" || isAuthor)) throw new ApiError(403, "Only author or admin can remove testcases");

  // try by _id first
  const idxById = q.testCases.findIndex((t) => String(t._id) === String(tcId));
  if (idxById !== -1) {
    q.testCases.splice(idxById, 1);
    await q.save();
  } else {
    const index = parseInt(tcId, 10);
    if (!Number.isNaN(index) && index >= 0 && index < q.testCases.length) {
      q.testCases.splice(index, 1);
      await q.save();
    } else {
      throw new ApiError(404, "Testcase not found");
    }
  }

  const populated = await populateAuthor(Question.findById(q._id));
  return res.status(200).json(new ApiResponse(200, { question: sanitizeQuestionForClient(await populated, actor) }, "Testcase removed"));
});

const bulkCreateQuestions = asyncHandler(async (req, res) => {
  const actor = req.user;
  if (!actor) throw new ApiError(401, "Unauthorized");
  if (!["teacher", "admin"].includes(actor.role))
    throw new ApiError(403, "Only teachers or admins can bulk-create questions");

  const { questions } = req.body;
  if (!Array.isArray(questions) || !questions.length) throw new ApiError(400, "questions array is required");

  if (q.type === "true_false" && typeof q.correctAnswer !== "boolean") {
    throw new ApiError(400, "true_false question must have correctAnswer as true or false");
  }

  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const docs = questions.map((q) => {
      const normalized = {
        title: (q.title || "").trim(),
        description: q.description || null,
        type: q.type,
        choices: Array.isArray(q.choices) ? q.choices.map((c, i) => ({ text: c.text || "", imageUrl: c.imageUrl || null, order: c.order || i })) : [],
        correctAnswer: q.correctAnswer || null,
        acceptableAnswers: Array.isArray(q.acceptableAnswers) ? q.acceptableAnswers : [],
        testCases: Array.isArray(q.testCases)
          ? q.testCases.map((t) => ({ input: t.input || "", expectedOutput: t.expectedOutput || "", weight: t.weight || 1, hidden: !!t.hidden }))
          : [],
        points: Number(q.points) || 1,
        difficulty: q.difficulty || "medium",
        tags: Array.isArray(q.tags) ? q.tags : [],
        author: actor._id,
        attachments: Array.isArray(q.attachments) ? q.attachments : [],
        isActive: typeof q.isActive === "boolean" ? q.isActive : true,
        requiresManualGrading: !!q.requiresManualGrading,
      };
      return normalized;
    });

    const created = await Question.insertMany(docs, { session });
    await session.commitTransaction();
    session.endSession();

    const populated = await populateAuthor(Question.find({ _id: { $in: created.map((c) => c._id) } }));

    const actorForSanitize = actor;
    const createdSanitized = (await populated).map((p) => sanitizeQuestionForClient(p, actorForSanitize));
    return res.status(201).json(new ApiResponse(201, { questions: createdSanitized }, "Bulk created"));
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
});

const assignQuestionsToCourse = asyncHandler(async (req, res) => {
  const actor = req.user;
  if (!actor) throw new ApiError(401, "Unauthorized");

  const { courseId } = req.params;
  const { questionIds } = req.body;

  if (!mongoose.Types.ObjectId.isValid(courseId))
    throw new ApiError(400, "Invalid course id");
  if (!Array.isArray(questionIds) || questionIds.length === 0)
    throw new ApiError(400, "questionIds array is required");

  const course = await Course.findById(courseId);
  if (!course) throw new ApiError(404, "Course not found");

  const isInstructor = course.instructors
    .map(String)
    .includes(String(actor._id));
  if (!(actor.role === "admin" || isInstructor))
    throw new ApiError(403, "Forbidden");

  const validQuestions = await Question.find({
    _id: { $in: questionIds },
    isActive: true,
  });

  if (validQuestions.length === 0)
    throw new ApiError(404, "No valid questions found");

  if (!Array.isArray(course.questions)) course.questions = [];

  const existingIds = course.questions.map((id) => String(id));
  const newIds = validQuestions
    .map((q) => String(q._id))
    .filter((id) => !existingIds.includes(id));

  if (newIds.length === 0)
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "All provided questions are already assigned"));

  course.questions.push(...newIds);
  await course.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      { assignedCount: newIds.length },
      `Assigned ${newIds.length} question(s) to course`
    )
  );
});

const removeQuestionsFromCourse = asyncHandler(async (req, res) => {
  const actor = req.user;
  if (!actor) throw new ApiError(401, "Unauthorized");

  const { courseId } = req.params;
  const { questionIds } = req.body;

  if (!mongoose.Types.ObjectId.isValid(courseId))
    throw new ApiError(400, "Invalid course id");
  if (!Array.isArray(questionIds) || questionIds.length === 0)
    throw new ApiError(400, "questionIds array is required");

  const course = await Course.findById(courseId);
  if (!course) throw new ApiError(404, "Course not found");

  // Allow only admin or instructors of the course
  const isInstructor = course.instructors
    .map(String)
    .includes(String(actor._id));
  if (!(actor.role === "admin" || isInstructor))
    throw new ApiError(403, "Forbidden");

  const beforeCount = course.questions.length;
  course.questions = course.questions.filter(
    (id) => !questionIds.includes(String(id))
  );

  const removedCount = beforeCount - course.questions.length;
  await course.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      { removedCount },
      `Removed ${removedCount} question(s) from course`
    )
  );
});

const listCourseQuestions = asyncHandler(async (req, res) => {
  const actor = req.user;
  if (!actor) throw new ApiError(401, "Unauthorized");

  const { courseId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(courseId))
    throw new ApiError(400, "Invalid course id");

  const course = await Course.findById(courseId).populate({
    path: "questions",
    model: "Question",
    populate: { path: "author", select: "name email role" },
  });

  if (!course) throw new ApiError(404, "Course not found");

  const isInstructor = course.instructors
    .map(String)
    .includes(String(actor._id));
  if (!(actor.role === "admin" || isInstructor))
    throw new ApiError(403, "Forbidden");

  const actorForSanitize = actor;
  const sanitized = course.questions.map((q) =>
    sanitizeQuestionForClient(q, actorForSanitize)
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      { courseId: course._id, questions: sanitized },
      "Course questions listed"
    )
  );
});

// --- Assign all active questions matching tag(s) (and optional filters) to a course ---
const assignQuestionsByTagToCourse = asyncHandler(async (req, res) => {
  const actor = req.user;
  if (!actor) throw new ApiError(401, "Unauthorized");

  const { courseId } = req.params;
  const { tags = [], difficulty, type } = req.body;

  if (!mongoose.Types.ObjectId.isValid(courseId))
    throw new ApiError(400, "Invalid course id");
  if (!Array.isArray(tags) || tags.length === 0)
    throw new ApiError(400, "tags array is required");

  const course = await Course.findById(courseId);
  if (!course) throw new ApiError(404, "Course not found");

  // Authorization: only admin or course instructors can modify
  const isInstructor = course.instructors
    .map(String)
    .includes(String(actor._id));
  if (!(actor.role === "admin" || isInstructor))
    throw new ApiError(403, "Forbidden");

  // Build filter
  const filter = { isActive: true, tags: { $in: tags } };
  if (difficulty) filter.difficulty = difficulty;
  if (type) filter.type = type;

  const matchingQuestions = await Question.find(filter, "_id");
  if (!matchingQuestions.length)
    throw new ApiError(404, "No matching questions found for the given criteria");

  // Prepare assignment
  if (!Array.isArray(course.questions)) course.questions = [];

  const existingIds = course.questions.map(String);
  const newIds = matchingQuestions
    .map((q) => String(q._id))
    .filter((id) => !existingIds.includes(id));

  if (newIds.length === 0)
    return res.status(200).json(
      new ApiResponse(
        200,
        { assignedCount: 0 },
        "All matching questions are already assigned to this course"
      )
    );

  course.questions.push(...newIds);
  await course.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        assignedCount: newIds.length,
        totalMatched: matchingQuestions.length,
        courseId: course._id,
        appliedFilters: { tags, difficulty, type },
      },
      `Assigned ${newIds.length} question(s) by tag(s) to course`
    )
  );
});


const listQuestionsByTag = asyncHandler(async (req, res) => {
  const actor = req.user; 

  const {
    tags,
    q, // optional text search
    difficulty,
    type,
    author,
    page = 1,
    limit = 20,
    sortBy = "createdAt",
    sortOrder = "desc",
    includeAnswers,
  } = req.body;

  // ✅ Require tags in body
  if (!tags) throw new ApiError(400, "tags field is required in the request body (array or comma-separated string)");

  // ✅ Convert tags to array (accepts string or array)
  const tagsArr = Array.isArray(tags)
    ? tags.map((t) => String(t).trim()).filter(Boolean)
    : String(tags)
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

  if (!tagsArr.length) throw new ApiError(400, "At least one valid tag is required");

  // ✅ Build filter
  const filter = { isActive: true, tags: { $in: tagsArr } };
  if (difficulty) filter.difficulty = difficulty;
  if (type) filter.type = type;
  if (author) filter.author = author;
  if (q) filter.$text = { $search: q };

  // ✅ Sorting & pagination
  const sort = {};
  sort[sortBy] = sortOrder === "asc" ? 1 : -1;
  const pageNum = Math.max(parseInt(page, 10), 1);
  const pageSize = Math.max(Math.min(parseInt(limit, 10), 200), 1);

  // ✅ Query + populate author
  const baseQuery = Question.find(filter);
  const [total, questions] = await Promise.all([
    Question.countDocuments(baseQuery.getQuery()),
    populateAuthor(baseQuery.sort(sort).skip((pageNum - 1) * pageSize).limit(pageSize)),
  ]);

  // ✅ Include answers only if admin or author (checked in sanitizer)
  const actorForSanitize = actor || null;
  const result = (await questions).map((qDoc) =>
    sanitizeQuestionForClient(qDoc, actorForSanitize)
  );

  // ✅ Response
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        meta: { total, page: pageNum, limit: pageSize },
        questions: result,
        filtersApplied: { tags: tagsArr, difficulty, type, author, q },
      },
      "Questions listed by tag"
    )
  );
});



export {
  createQuestion,
  updateQuestion,
  getQuestion,
  listQuestions,
  deleteQuestion,
  restoreQuestion,
  addChoice,
  removeChoice,
  addTestCase,
  removeTestCase,
  bulkCreateQuestions,
  assignQuestionsToCourse,
  removeQuestionsFromCourse,
  listCourseQuestions,
  assignQuestionsByTagToCourse,
  listQuestionsByTag,
};
