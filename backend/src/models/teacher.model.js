import User from "./user.model.js"
import Course from "./course.model.js"
import { Schema, model } from "mongoose"

const teacherSchema = new Schema({
    teacher: {
        type: Schema.Types.ObjectId,
        ref: "User",
        unique: true,
        required: true
    },
    facultyId: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    department: {
      type: String,
      required: true,
      trim: true,
    },
    designation: {
      type: String,
      enum: ["Professor", "Associate Professor", "Assistant Professor", "Lecturer"],
      default: "Lecturer",
    },
    teach: [
      {
        type: Schema.Types.ObjectId,
        ref: "Course"
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
}, {timestamps: true})

const Teacher = model("Teacher", teacherSchema)
export default Teacher;