import mongoose from "mongoose";
const { Schema, model } = mongoose;

const ChoiceSchema = new Schema({
  _id: { type: Schema.Types.ObjectId, auto: true },
  text: { type: String, trim: true },
  imageUrl: { type: String, default: null },
  order: { type: Number, default: 0 },
});

const TestCaseSchema = new Schema({
  input: { type: String },
  expectedOutput: { type: String },
  weight: { type: Number, default: 1 },
  hidden: { type: Boolean, default: false },
});

const QuestionSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: null },
    type: {
      type: String,
      required: true,
      enum: [
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
      ],
    },
    choices: [ChoiceSchema], 
    correctAnswer: { type: Schema.Types.Mixed, default: null },

    acceptableAnswers: [
      {
        text: { type: String },
        regex: { type: Boolean, default: false },
        caseSensitive: { type: Boolean, default: false },
      },
    ],

    testCases: [TestCaseSchema],
    points: { type: Number, default: 1 },
    difficulty: { type: String, enum: ["easy", "medium", "hard"], default: "medium" },
    tags: [{ type: String, index: true }],
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    attachments: [{ type: String }],
    isActive: { type: Boolean, default: true },
    requiresManualGrading: { type: Boolean, default: false }, 
  },
  { timestamps: true }
);

QuestionSchema.index({ author: 1, difficulty: 1, tags: 1 });

QuestionSchema.pre("validate", function (next) {
  if (this.type === "true_false") {
    if (typeof this.correctAnswer !== "boolean") {
      return next(new Error("True/False question must have correctAnswer as boolean"));
    }
    this.choices = [];
    this.testCases = [];
  }
  next();
});

export default model("Question", QuestionSchema);
