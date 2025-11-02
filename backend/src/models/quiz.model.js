import mongoose from "mongoose";
const { Schema, model } = mongoose;

const PoolItemSchema = new Schema({
  question: { type: Schema.Types.ObjectId, ref: "Question", required: true },
  weight: { type: Number, default: 1 },
});

const GenerationRuleSchema = new Schema({
  tags: [{ type: String }],
  difficulty: { type: String, enum: ["easy", "medium", "hard"] },
  count: { type: Number, default: 0 },
});

const QuizSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: null },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    course: { type: Schema.Types.ObjectId, ref: "Course", default: null },

    questionPool: [PoolItemSchema],

    generationRules: [GenerationRuleSchema],

    durationMinutes: { type: Number, required: true },
    randomizeQuestions: { type: Boolean, default: true },
    randomizeOptions: { type: Boolean, default: true },

    startTime: { type: Date, default: null },
    endTime: { type: Date, default: null },

    allowRetake: { type: Boolean, default: false },
    attemptsAllowed: { type: Number, default: 1 },

    autoGrade: { type: Boolean, default: true },
    isPublished: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },

    totalPoints: { type: Number, default: 0 },

    meta: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

QuizSchema.index({ author: 1, course: 1, startTime: 1 });

export default model("Quiz", QuizSchema);
