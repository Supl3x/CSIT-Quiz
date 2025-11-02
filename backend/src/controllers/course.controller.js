// src/controllers/course.controller.js
import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncWrapper.js";
import { ApiError } from "../utils/errorHandler.js";
import { ApiResponse } from "../utils/response.js";

import Course from "../models/course.model.js";
import User from "../models/user.model.js";
import Teacher from "../models/teacher.model.js";
import Student from "../models/student.model.js";


const sanitizeCourse = (courseDoc) => {
  if (!courseDoc) return null;
  const obj = courseDoc.toObject ? courseDoc.toObject() : { ...courseDoc };
  delete obj.__v;
  return obj;
};

const populateCourse = (query) =>
  query.populate({
    path: "instructors",
    model: "User",
    select: "name email avatar role isVerified",
  });

const createCourse = asyncHandler(async (req, res) => {
  const actor = req.user;
  if (!actor) throw new ApiError(401, "Unauthorized");

  // Only teachers and admins can create courses
  if (!["teacher", "admin"].includes(actor.role)) {
    throw new ApiError(403, "Only teachers and admins can create courses");
  }

  const {
    title,
    code,
    department,
    credits = 3,
    semester = "N/A",
    academicYear = null,
    instructors = [],
    isActive = true,
  } = req.body;

  if (!title || !code || !department) {
    throw new ApiError(400, "title, code and department are required");
  }

  const instructorIds = Array.isArray(instructors) ? [...new Set(instructors.map(String))] : [];

  if (instructorIds.length === 0) {
    // If creator is teacher and didn't pass instructors, add themself
    if (actor.role === "teacher") {
      instructorIds.push(String(actor._id));
    } else {
      throw new ApiError(400, "At least one instructor is required");
    }
  }

  // fetch and validate instructors exist and have teacher/admin role
  const users = await User.find({ _id: { $in: instructorIds } }).select("_id role");
  const foundIds = new Set(users.map((u) => String(u._id)));
  for (const id of instructorIds) {
    if (!foundIds.has(String(id))) throw new ApiError(400, `Instructor ${id} not found`);
    const u = users.find((x) => String(x._id) === String(id));
    if (!["teacher", "admin"].includes(u.role)) {
      throw new ApiError(400, `User ${id} is not eligible to be an instructor`);
    }
  }

  // Use a session to create Course and add to Teacher.teach arrays
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const existing = await Course.findOne({ code }).session(session);
    if (existing) throw new ApiError(409, "Course code already exists");

    const course = await Course.create(
      [
        {
          title,
          code,
          department,
          credits,
          semester,
          academicYear,
          instructors: instructorIds,
          isActive,
        },
      ],
      { session }
    );

    // Ensure teachers' teach arrays include this course
    await Teacher.updateMany(
      { teacher: { $in: instructorIds } },
      { $addToSet: { teach: course[0]._id } },
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    const populated = await populateCourse(Course.findById(course[0]._id));

    return res.status(201).json(new ApiResponse(201, { course: sanitizeCourse(await populated) }, "Course created"));
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
});


const getCourse = asyncHandler(async (req, res) => {
  const {courseId} = req.params;
  if (!mongoose.Types.ObjectId.isValid(courseId)) throw new ApiError(400, "Invalid course id");

  const course = await populateCourse(Course.findById(courseId));
  if (!course) throw new ApiError(404, "Course not found");

  return res.status(200).json(new ApiResponse(200, { course: sanitizeCourse(await course) }, "Course fetched"));
});


const updateCourse = asyncHandler(async (req, res) => {
  const actor = req.user;
  if (!actor) throw new ApiError(401, "Unauthorized");

  const {courseId} = req.params;
  if (!mongoose.Types.ObjectId.isValid(courseId)) throw new ApiError(400, "Invalid course id");

  const course = await Course.findById(courseId);
  if (!course) throw new ApiError(404, "Course not found");

  const isInstructor = course.instructors.map(String).includes(String(actor._id));
  if (!(actor.role === "admin" || isInstructor)) {
    throw new ApiError(403, "Forbidden");
  }

  const allowed = ["title", "department", "credits", "semester", "academicYear", "isActive", "code"];
  const updates = {};
  for (const key of allowed) {
    if (Object.prototype.hasOwnProperty.call(req.body, key)) updates[key] = req.body[key];
  }

  if (req.body.instructors) {
    throw new ApiError(400, "Use assign/unassign instructor endpoints to modify instructors");
  }

  const updated = await Course.findByIdAndUpdate(courseId, { $set: updates }, { new: true, runValidators: true });
  const populated = await populateCourse(Course.findById(updated._id));
  return res.status(200).json(new ApiResponse(200, { course: sanitizeCourse(await populated) }, "Course updated"));
});


const toggleCourseActive = asyncHandler(async (req, res) => {
  const actor = req.user;
  if (!actor) throw new ApiError(401, "Unauthorized");

  const {courseId} = req.params;
  if (!mongoose.Types.ObjectId.isValid(courseId)) throw new ApiError(400, "Invalid course id");

  const course = await Course.findById(courseId);
  if (!course) throw new ApiError(404, "Course not found");

  const isInstructor = course.instructors.map(String).includes(String(actor._id));
  if (!(actor.role === "admin" || isInstructor)) {
    throw new ApiError(403, "Forbidden");
  }

  // const { isActive } = req.body;
  // if (typeof isActive !== "boolean") throw new ApiError(400, "isActive boolean required");

  course.isActive = !course.isActive;
  await course.save();

  const populated = await populateCourse(Course.findById(course._id));
  return res.status(200).json(new ApiResponse(200, { course: sanitizeCourse(await populated) }, `Course ${course.isActive ? "unarchived" : "archived"}`));
});

const deleteCourse = asyncHandler(async (req, res) => {
  const actor = req.user;
  if (!actor) throw new ApiError(401, "Unauthorized");
  if (actor.role !== "admin") throw new ApiError(403, "Only admin can hard-delete courses");

  const {courseId} = req.params;
  if (!mongoose.Types.ObjectId.isValid(courseId)) throw new ApiError(400, "Invalid course id");

  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const course = await Course.findById(courseId).session(session);
    if (!course) throw new ApiError(404, "Course not found");

    await Student.updateMany({ enrolledCourses: course._id }, { $pull: { enrolledCourses: course._id } }, { session });
    await Teacher.updateMany({ teach: course._id }, { $pull: { teach: course._id } }, { session });
    await Course.deleteOne({ _id: course._id }, { session });

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json(new ApiResponse(200, {}, "Course permanently deleted and references cleaned"));
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
});

const assignInstructor = asyncHandler(async (req, res) => {
  const actor = req.user;
  if (!actor) throw new ApiError(401, "Unauthorized");

  const {courseId} = req.params;
  const { instructorId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(courseId) || !mongoose.Types.ObjectId.isValid(instructorId)) {
    throw new ApiError(400, "Invalid id(s)");
  }

  const course = await Course.findById(courseId);
  if (!course) throw new ApiError(404, "Course not found");

  if (actor.role === "teacher" && String(actor._id) !== String(instructorId)) {
    throw new ApiError(403, "Teachers can only assign themselves");
  }

  const user = await User.findById(instructorId).select("role");
  if (!user) throw new ApiError(404, "Instructor user not found");
  if (!["teacher", "admin"].includes(user.role)) throw new ApiError(400, "User is not eligible to be an instructor");

  if (course.instructors.map(String).includes(String(instructorId))) {
    throw new ApiError(409, "Instructor already assigned to course");
  }
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    course.instructors.push(instructorId);
    await course.save({ session });

    // ensure teacher doc exists
    let teacher = await Teacher.findOne({ teacher: instructorId }).session(session);
    if (!teacher) {
      teacher = await Teacher.create(
        [
          {
            teacher: instructorId,
            facultyId: `auto-${Date.now()}`,
            department: course.department || "Unknown",
            designation: "Lecturer",
            teach: [course._id],
          },
        ],
        { session }
      );
    } else {
      teacher.teach.push(course._id);
      await teacher.save({ session });
    }

    await session.commitTransaction();
    session.endSession();
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }

  const populated = await populateCourse(Course.findById(course._id));
  return res.status(200).json(new ApiResponse(200, { course: sanitizeCourse(await populated) }, "Instructor assigned"));
});

const unassignInstructor = asyncHandler(async (req, res) => {
  const actor = req.user;
  if (!actor) throw new ApiError(401, "Unauthorized");

  const {courseId} = req.params;
  const { instructorId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(courseId) || !mongoose.Types.ObjectId.isValid(instructorId)) {
    throw new ApiError(400, "Invalid id(s)");
  }

  const course = await Course.findById(courseId);
  if (!course) throw new ApiError(404, "Course not found");

  if (actor.role === "teacher" && String(actor._id) !== String(instructorId)) {
    throw new ApiError(403, "Teachers can only unassign themselves");
  }

  if (!course.instructors.map(String).includes(String(instructorId))) {
    throw new ApiError(404, "Instructor not assigned to this course");
  }

  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    course.instructors = course.instructors.filter((i) => String(i) !== String(instructorId));
    await course.save({ session });

    await Teacher.updateOne({ teacher: instructorId }, { $pull: { teach: course._id } }, { session });

    await session.commitTransaction();
    session.endSession();
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }

  const populated = await populateCourse(Course.findById(course._id));
  return res.status(200).json(new ApiResponse(200, { course: sanitizeCourse(await populated) }, "Instructor unassigned"));
});

const listCourses = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    q,
    department,
    semester,
    academicYear,
    isActive,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;

  const filter = {};
  if (typeof isActive !== "undefined") filter.isActive = isActive === "true";
  if (department) filter.department = department;
  if (semester) filter.semester = semester;
  if (academicYear) filter.academicYear = academicYear;

  const query = Course.find(filter);

  if (q) {
    query.find({ $text: { $search: q } });
  }

  // sorting
  const sort = {};
  sort[sortBy] = sortOrder === "asc" ? 1 : -1;

  const pageNum = Math.max(parseInt(page, 10), 1);
  const pageSize = Math.max(Math.min(parseInt(limit, 10), 200), 1);

  const [total, courses] = await Promise.all([
    Course.countDocuments(query.getQuery()),
    populateCourse(query.sort(sort).skip((pageNum - 1) * pageSize).limit(pageSize)),
  ]);

  return res.status(200).json(
    new ApiResponse(200, { meta: { total, page: pageNum, limit: pageSize }, courses: (await courses).map(sanitizeCourse) }, "Courses listed")
  );
});

const ensureCourseExists = asyncHandler(async (req, res, next) => {
  const courseId = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(courseId)) throw new ApiError(400, "Invalid course id");
  const course = await Course.findById(courseId);
  if (!course) throw new ApiError(404, "Course not found");
  req.course = course;
  next();
});


export {
  createCourse,
  getCourse,
  updateCourse,
  toggleCourseActive,
  deleteCourse,
  assignInstructor,
  unassignInstructor,
  listCourses,
  ensureCourseExists
}