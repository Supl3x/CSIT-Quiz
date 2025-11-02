import User from "./user.model.js";
import mongoose from "mongoose";
import Course from "./course.model.js";

const { Schema, model } = mongoose;

const studentSchema = new Schema(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: "User",
      unique: true,
      required: true,
    },
    rollNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    year: {
      type: Number,
      required: true,
      min: 1,
    },
    program: {
      type: String,
      required: true,
      trim: true,
    },
    enrolledCourses: [
      {
        type: Schema.Types.ObjectId,
        ref: "Course",
      },
    ],
    contactNumber: {
      type: String,
      match: [/^\+?[0-9]{10,15}$/, "Invalid phone number"],
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Student = model("Student", studentSchema);

export default Student;
