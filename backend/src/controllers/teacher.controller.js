// src/controllers/teacher.controller.js
import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncWrapper.js";
import { ApiError } from "../utils/errorHandler.js";
import { ApiResponse } from "../utils/response.js";

import User from "../models/user.model.js";
import Teacher from "../models/teacher.model.js";
import Course from "../models/course.model.js";

const MAX_TEACHABLE_COURSES = 10;

const sanitizeTeacher = (teacherDoc) => {
  if (!teacherDoc) return null;
  const obj = teacherDoc.toObject ? teacherDoc.toObject() : { ...teacherDoc };
  delete obj.__v;
  return obj;
};

const createTeacherProfile = asyncHandler(async (req, res) => {
  const userId = req.user && req.user._id;
  if (!userId) throw new ApiError(401, "Unauthorized");

  if (req.user.role !== "teacher")
    throw new ApiError(403, "Only users with role 'teacher' can create a teacher profile");

  const existing = await Teacher.findOne({ teacher: userId });
  if (existing) throw new ApiError(409, "Teacher profile already exists");

  const { facultyId, department, designation, teach = [], contactNumber } = req.body;

  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, "User not found");

  const facultyExists = await Teacher.findOne({ facultyId });
  if (facultyExists) throw new ApiError(409, "Faculty ID already in use");

  // Validate teach array (if provided)
  let cleanedTeach = Array.isArray(teach) ? [...new Set(teach.map(String))] : [];
  if (cleanedTeach.length > 0) {
    const courses = await Course.find({ _id: { $in: cleanedTeach } }).select("_id isActive");
    const foundIds = new Set(courses.map((c) => String(c._id)));

    for (const id of cleanedTeach) {
      if (!foundIds.has(String(id))) throw new ApiError(400, `Course ${id} not found`);
      const c = courses.find((x) => String(x._id) === String(id));
      if (!c.isActive) throw new ApiError(400, `Course ${id} is not active`);
    }
  }

  if (cleanedTeach.length > MAX_TEACHABLE_COURSES) {
    throw new ApiError(400, `Teachers can be assigned to at most ${MAX_TEACHABLE_COURSES} courses`);
  }

  const teacher = await Teacher.create({
    teacher: userId,
    facultyId,
    department,
    designation,
    teach: cleanedTeach,
    contactNumber: contactNumber || null,
  });

  await User.findByIdAndUpdate(userId, { profileCompleted: true });

  const populatedTeacher = await Teacher.findById(teacher._id)
    .populate({
      path: "teacher",
      select: "name email avatar role isVerified",
    })
    .populate({
      path: "teach",
      select: "title code department semester academicYear",
    });

  const avatarUrl = populatedTeacher.teacher.avatar
    ? `${req.protocol}://${req.get("host")}/images/avatars/${populatedTeacher.teacher.avatar}`
    : null;

  return res.status(201).json(
    new ApiResponse(
      201,
      {
        ...populatedTeacher.toObject(),
        teacher: { ...sanitizeTeacher(populatedTeacher.teacher), avatarUrl },
      },
      "Teacher profile created successfully"
    )
  );
});

const getTeacherProfile = asyncHandler(async (req, res) => {
  const userId = req.user && req.user._id;
  if (!userId) throw new ApiError(401, "Unauthorized");

  const teacher = await Teacher.findOne({ teacher: userId })
    .populate({
      path: "teacher",
      select: "name email avatar role isVerified",
    })
    .populate({
      path: "teach",
      model: "Course",
      select: "title code department semester academicYear",
    });

  if (!teacher) throw new ApiError(404, "Teacher profile not found");

  const avatarUrl = teacher.teacher.avatar
    ? `${req.protocol}://${req.get("host")}/images/avatars/${teacher.teacher.avatar}`
    : null;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        ...teacher.toObject(),
        teacher: { ...sanitizeTeacher(teacher.teacher), avatarUrl },
      },
      "Teacher profile fetched successfully"
    )
  );
});

const updateTeacherProfile = asyncHandler(async (req, res) => {
  const userId = req.user && req.user._id;
  if (!userId) throw new ApiError(401, "Unauthorized");

  const updates = {};
  const allowed = ["facultyId", "department", "designation", "contactNumber"];
  for (const key of allowed) {
    if (Object.prototype.hasOwnProperty.call(req.body, key)) updates[key] = req.body[key];
  }

  if (updates.facultyId) {
    const exists = await Teacher.findOne({
      facultyId: updates.facultyId,
      teacher: { $ne: userId },
    });
    if (exists) throw new ApiError(409, "Faculty ID already in use");
  }

  const updated = await Teacher.findOneAndUpdate({ teacher: userId }, { $set: updates }, { new: true })
    .populate({
      path: "teacher",
      select: "name email avatar role isVerified",
    })
    .populate({
      path: "teach",
      model: "Course",
      select: "title code department semester academicYear",
    });

  if (!updated) throw new ApiError(404, "Teacher profile not found");

  const avatarUrl = updated.teacher.avatar
    ? `${req.protocol}://${req.get("host")}/images/avatars/${updated.teacher.avatar}`
    : null;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        ...updated.toObject(),
        teacher: { ...sanitizeTeacher(updated.teacher), avatarUrl },
      },
      "Teacher profile updated successfully"
    )
  );
});

const assignCourse = asyncHandler(async (req, res) => {
  const userId = req.user && req.user._id;
  if (!userId) throw new ApiError(401, "Unauthorized");
  if (req.user.role !== "teacher") throw new ApiError(403, "Only teachers can assign themselves courses");

  const { courseId } = req.params;
  if (!courseId) throw new ApiError(400, "Missing courseId");

  const course = await Course.findById(courseId);
  if (!course || !course.isActive) throw new ApiError(404, "Course not found or not active");

  const teacher = await Teacher.findOne({ teacher: userId });
  if (!teacher) throw new ApiError(404, "Teacher profile not found");

  const already = teacher.teach.find((c) => String(c) === String(courseId));
  if (already) throw new ApiError(409, "Already assigned to this course");

  if (teacher.teach.length >= MAX_TEACHABLE_COURSES)
    throw new ApiError(400, `Teachers can teach at most ${MAX_TEACHABLE_COURSES} courses`);

  teacher.teach.push(courseId);
  await teacher.save();

  const updated = await Teacher.findOne({ teacher: userId })
    .populate("teacher", "name email role isVerified")
    .populate("teach", "title code department semester academicYear");

  // const avatarUrl = updated.teacher.avatar
  //   ? `${req.protocol}://${req.get("host")}/images/avatars/${updated.teacher.avatar}`
  //   : null;

  return res.status(200).json(
    new ApiResponse(
      200,
      { ...updated.toObject(), teacher: { ...sanitizeTeacher(updated.teacher) } },
      "Course assigned successfully"
    )
  );
});

const unassignCourse = asyncHandler(async (req, res) => {
  const userId = req.user && req.user._id;
  if (!userId) throw new ApiError(401, "Unauthorized");

  if (req.user.role !== "teacher") throw new ApiError(403, "Only teachers can unassign courses");

  const { courseId } = req.params;
  if (!courseId) throw new ApiError(400, "Missing courseId");

  const teacher = await Teacher.findOne({ teacher: userId });
  if (!teacher) throw new ApiError(404, "Teacher profile not found");

  const index = teacher.teach.findIndex((c) => String(c) === String(courseId));
  if (index === -1) throw new ApiError(404, "Not assigned to this course");

  teacher.teach.splice(index, 1);
  await teacher.save();

  const updated = await Teacher.findOne({ teacher: userId })
    .populate("teacher", "name email role isVerified")
    .populate("teach", "title code department semester academicYear");

  // const avatarUrl = updated.teacher.avatar
  //   ? `${req.protocol}://${req.get("host")}/images/avatars/${updated.teacher.avatar}`
  //   : null;

  return res.status(200).json(
    new ApiResponse(
      200,
      { ...updated.toObject(), teacher: { ...sanitizeTeacher(updated.teacher) } },
      "Course unassigned successfully"
    )
  );
});

const listTaughtCourses = asyncHandler(async (req, res) => {
  const userId = req.user && req.user._id;
  let targetTeacherId = userId;

  if ((req.user.role === "admin") && req.query.teacherId) {
    targetTeacherId = req.query.teacherId;
  }

  const teacher = await Teacher.findOne({ teacher: targetTeacherId })
    .populate("teacher", "name email role isVerified")
    .populate("teach", "title code department semester academicYear");

  if (!teacher) throw new ApiError(404, "Teacher profile not found");

  return res.status(200).json(
    new ApiResponse(200, { courses: { ...sanitizeTeacher(teacher.teacher) } }, "Taught courses fetched successfully")
  );
});

const deleteTeacherProfile = asyncHandler(async (req, res) => {
  const actor = req.user;
  const targetTeacherId = req.params?.teacherId || actor._id;

  if (actor.role !== "admin" && String(targetTeacherId) !== String(actor._id)) {
    throw new ApiError(403, "Forbidden");
  }

  const teacherProfile = await Teacher.findOne({ teacher: targetTeacherId });
  if (!teacherProfile) throw new ApiError(404, "Teacher profile not found");

  await Course.updateMany(
    { instructors: targetTeacherId },
    { $pull: { instructors: targetTeacherId } },
  );

  if (teacherProfile.teach.length > 0) {
    await Course.updateMany(
      { _id: { $in: teacherProfile.teach } },
      { $pull: { instructors: targetTeacherId } }
    );
  }
  await Teacher.deleteOne({ _id: teacherProfile._id });

  await User.updateOne(
    { _id: targetTeacherId },
    { $set: { profileCompleted: false } }
  );


  return res.status(200).json(new ApiResponse(200, {}, "Teacher profile deleted successfully"));
});

const ensureTeacherProfileCompleted = asyncHandler(async (req, res, next) => {
  const userId = req.user && req.user._id;
  if (!userId) throw new ApiError(401, "Unauthorized");

  const profile = await Teacher.findOne({ teacher: userId });
  if (!profile) throw new ApiError(403, "Please complete your teacher profile before proceeding");

  if (!profile.facultyId || !profile.department) {
    throw new ApiError(403, "Please complete faculty ID and department in your profile");
  }

  req.teacherProfile = profile;
  next();
});

export {
    createTeacherProfile,
    getTeacherProfile,
    updateTeacherProfile,
    assignCourse,
    unassignCourse,
    listTaughtCourses,
    deleteTeacherProfile,
    ensureTeacherProfileCompleted,
}
