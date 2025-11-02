// src/controllers/student.controller.js
import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncWrapper.js";
import { ApiError } from "../utils/errorHandler.js";
import { ApiResponse } from "../utils/response.js";

import User from "../models/user.model.js";
import Student from "../models/student.model.js";
import Course from "../models/course.model.js";

const MAX_ENROLLMENTS = 5;

const sanitizeStudent = (studentDoc) => {
  if (!studentDoc) return null;
  const obj = studentDoc.toObject ? studentDoc.toObject() : { ...studentDoc };
  delete obj.__v;
  return obj;
};

const createStudentProfile = asyncHandler(async (req, res) => {
  const userId = req.user && req.user._id;
  if (!userId) throw new ApiError(401, "Unauthorized");

  if (req.user.role !== "student")
    throw new ApiError(403, "Only users with role 'student' can create a student profile");

  const existing = await Student.findOne({ student: userId });
  if (existing) throw new ApiError(409, "Student profile already exists");

  const { rollNumber, year, program, enrolledCourses = [], contactNumber } = req.body;

  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, "User not found");

  const rollExists = await Student.findOne({ rollNumber });
  if (rollExists) throw new ApiError(409, "rollNumber already registered");


  let cleanedCourses = Array.isArray(enrolledCourses) ? [...new Set(enrolledCourses.map(String))] : [];
  if (cleanedCourses.length > 0) {
    const courses = await Course.find({ _id: { $in: cleanedCourses } }).select("_id isActive");
    const foundIds = new Set(courses.map((c) => String(c._id)));
    for (const id of cleanedCourses) {
      if (!foundIds.has(String(id))) throw new ApiError(400, `Course ${id} not found`);
      const c = courses.find((x) => String(x._id) === String(id));
      if (!c.isActive) throw new ApiError(400, `Course ${id} is not active`);
    }
  }

  if (cleanedCourses.length > MAX_ENROLLMENTS) {
    throw new ApiError(400, `Students can enroll in at most ${MAX_ENROLLMENTS} courses`);
  }

  const student = await Student.create({
    student: userId,
    rollNumber,
    year,
    program,
    enrolledCourses: cleanedCourses,
    contactNumber: contactNumber || null,
  });

  const populatedStudent = await Student.findById(student._id)
  .populate({
    path: "student",
    select: "name email avatar role isVerified",
  }).populate({
    path: "enrolledCourses",
    select: "title code department semester academicYear"
  });

  await User.findByIdAndUpdate(userId, { profileCompleted: true });

  const userWithAvatarUrl = {
    ...populatedStudent._doc,
    avatarUrl: populatedStudent.student.avatar
      ? `${req.protocol}://${req.get("host")}/images/avatars/${populatedStudent.student.avatar}`
      : null,
  };

  return res
    .status(201)
    .json(
      new ApiResponse(201, {
        student: { ...sanitizeStudent(userWithAvatarUrl)},
      }, "Student profile created successfully")
    );
});


const getStudentProfile = asyncHandler(async (req, res) => {
  const userId = req.user && req.user._id;
  if (!userId) throw new ApiError(401, "Unauthorized");

  const student = await Student.findOne({ student: userId })
  .populate({
    path: "student",
    select: "name email avatar role isVerified",
  })
  .populate({
    path: "enrolledCourses",
    model: "Course",
    select: "title code department semester academicYear",
  });

  if (!student) throw new ApiError(404, "Student profile not found");


  const avatarUrl = student.student.avatar
    ? `${req.protocol}://${req.get("host")}/images/avatars/${student.student.avatar}`
    : null;


  const userWithAvatarUrl = {
    ...student._doc,
    avatarUrl: student.student.avatar
      ? `${req.protocol}://${req.get("host")}/images/avatars/${student.student.avatar}`
      : null,
  };

  return res
  .status(200)
  .json(new ApiResponse(200, {
      student: { ...sanitizeStudent(userWithAvatarUrl) },
    }, "Student profile fetched successfully")
  );
});

const updateStudentProfile = asyncHandler(async (req, res) => {
  const userId = req.user && req.user._id;
  if (!userId) throw new ApiError(401, "Unauthorized");

  const updates = {};
  const allowed = ["rollNumber", "year", "program", "contactNumber"];
  for (const key of allowed) {
    if (Object.prototype.hasOwnProperty.call(req.body, key)) updates[key] = req.body[key];
  }

  if (updates.rollNumber) {
    const existing = await Student.findOne({ rollNumber: updates.rollNumber, student: { $ne: userId } });
    if (existing) throw new ApiError(409, "rollNumber already in use");
  }

  const updated = await Student.findOneAndUpdate({ student: userId }, { $set: updates }, { new: true })
  .populate({
    path: "student",
    select: "name email role isVerified avatar"
  })
  .populate({
    path: "enrolledCourses",
    model: "Course",
    select: "title code department semester academicYear",
  });

  if (!updated) throw new ApiError(404, "Student profile not found");

  const userWithAvatarUrl = {
    ...updated._doc,
    avatarUrl: updated.student.avatar
      ? `${req.protocol}://${req.get("host")}/images/avatars/${updated.student.avatar}`
      : null,
  };
  return res
    .status(200)
    .json(
      new ApiResponse(200, {
        student: { ...sanitizeStudent(userWithAvatarUrl)},
      }, "Student profile updated successfully")
    );
});


const enrollInCourse = asyncHandler(async (req, res) => {
  const userId = req.user && req.user._id;
  if (!userId) throw new ApiError(401, "Unauthorized");

  if (req.user.role !== "student") throw new ApiError(403, "Only students can enroll in courses");

  const courseId = req.params.courseId;
  if (!courseId) throw new ApiError(400, "Missing courseId");

  const course = await Course.findById(courseId);
  if (!course || !course.isActive) throw new ApiError(404, "Course not found or not active");

  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const student = await Student.findOne({ student: userId }).session(session);
    if (!student) throw new ApiError(404, "Student profile not found");

    // check already enrolled
    const already = student.enrolledCourses.find((c) => String(c) === String(courseId));
    if (already) throw new ApiError(409, "Already enrolled in this course");

    if (student.enrolledCourses.length >= MAX_ENROLLMENTS) {
      throw new ApiError(400, `Students can be enrolled in at most ${MAX_ENROLLMENTS} courses`);
    }
    // push to enrolledCourses
    student.enrolledCourses.push(courseId);
    await student.save({session});
    
    await session.commitTransaction();
    session.endSession();

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }

    // optional: if you maintain Course.enrollmentCount or Enrollment collection, increment it here


    const updated = await Student.findOne({ student: userId })
    .populate({
      path: "student",
      select: "name email role avatar isVerified"
    })
    .populate({
      path: "enrolledCourses",
      model: "Course",
      select: "title code department semester academicYear",
    });

  const userWithAvatarUrl = {
    ...updated._doc,
    avatarUrl: updated.student.avatar
      ? `${req.protocol}://${req.get("host")}/images/avatars/${updated.student.avatar}`
      : null,
  };

    return res.status(200).json(new ApiResponse(200, { student: { ...sanitizeStudent(userWithAvatarUrl) } }, "Enrolled in course successfully"));

});


const unenrollFromCourse = asyncHandler(async (req, res) => {
  const userId = req.user && req.user._id;
  if (!userId) throw new ApiError(401, "Unauthorized");

  if (req.user.role !== "student") throw new ApiError(403, "Only students can unenroll from courses");

  const {courseId} = req.params;
  if (!courseId) throw new ApiError(400, "Missing courseId");

    const student = await Student.findOne({ student: userId });
    if (!student) throw new ApiError(404, "Student profile not found");

    const index = student.enrolledCourses.findIndex((c) => String(c) === String(courseId));
    if (index === -1) throw new ApiError(404, "Not enrolled in this course");

    student.enrolledCourses.splice(index, 1);
    await student.save();


    const updated = await Student.findOne({ student: userId })
    .populate({
      path: "student",
      select: "name email role avatar isVerified"
    })
    .populate({
      path: "enrolledCourses",
      model: "Course",
      select: "title code department semester academicYear",
    });

    const userWithAvatarUrl = {
      ...updated._doc,
      avatarUrl: updated.student.avatar
        ? `${req.protocol}://${req.get("host")}/images/avatars/${updated.student.avatar}`
        : null,
    };


    return res.status(200).json(new ApiResponse(200, { student: { ...sanitizeStudent(userWithAvatarUrl) } }, "Unenrolled from course"));

});


const listEnrolledCourses = asyncHandler(async (req, res) => {
  const userId = req.user && req.user._id;
  let targetStudentId = userId;

  if ((req.user.role === "admin" || req.user.role === "teacher") && req.query.studentId) {
    targetStudentId = req.query.studentId;
  }

  const student = await Student.findOne({ student: targetStudentId }).populate({
    path: "enrolledCourses",
    model: "Course",
    select: "title code department semester academicYear",
  });

  if (!student) throw new ApiError(404, "Student profile not found");

  return res.status(200).json(new ApiResponse(200, { courses: student.enrolledCourses }, "Enrolled courses fetched"));
});


const deleteStudentProfile = asyncHandler(async (req, res) => {
  const actor = req.user;
  const targetStudentId = req.params?.studentId || actor._id;

  if (actor.role !== "admin" && String(targetStudentId) !== String(actor._id)) {
    throw new ApiError(403, "Forbidden");
  }

  const studentProfile = await Student.findOne({ student: targetStudentId });
  if (!studentProfile) throw new ApiError(404, "Student profile not found");

  await Student.deleteOne({ _id: studentProfile._id });

  return res.status(200).json(new ApiResponse(200, {}, "Student profile deleted"));
});


const ensureStudentProfileCompleted = asyncHandler(async (req, res, next) => {
  const userId = req.user && req.user._id;
  if (!userId) throw new ApiError(401, "Unauthorized");

  const profile = await Student.findOne({ student: userId });
  if (!profile) throw new ApiError(403, "Please complete your student profile before taking quizzes");

  // minimal checks
  if (!profile.rollNumber || !profile.program || !profile.year) {
    throw new ApiError(403, "Please complete roll number, year, and program fields in your profile");
  }

  req.studentProfile = profile; // attach for downstream handlers
  next();
});

export {
  createStudentProfile,
  getStudentProfile,
  updateStudentProfile,
  enrollInCourse,
  unenrollFromCourse,
  listEnrolledCourses,
  deleteStudentProfile,
  ensureStudentProfileCompleted
}
