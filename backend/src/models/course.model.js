import mongoose from "mongoose";
import Question from "./question.model.js";
const { Schema, model } = mongoose;


const CourseSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 240,
      index: true,
    },

    code: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      unique: true,
      match: [/^[A-Z0-9\-_]{3,20}$/, "Course code must be 3-20 chars: letters, numbers, -, _"],
    },

    department: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    credits: {
      type: Number,
      default: 3,
      min: 0,
      max: 30,
    },

    semester: {
      type: String,
      enum: ["Spring", "Fall", "N/A"],
      default: "N/A",
    },

    academicYear: {
      type: String,
      trim: true,
      default: null,
    },
    questions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }],
    instructors: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],


    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true }
);

CourseSchema.index({ title: "text" });

CourseSchema.pre("validate", function (next) {
  if (!Array.isArray(this.instructors) || this.instructors.length === 0) {
    next(new Error("Course must have at least one instructor"));
  } else {
    next();
  }
});


CourseSchema.methods.toPublicJSON = function () {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

const Course = model("Course", CourseSchema);
export default Course;
