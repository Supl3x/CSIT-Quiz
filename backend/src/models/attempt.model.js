import mongoose from "mongoose";
const { Schema, model } = mongoose;

const SnapshotChoiceSchema = new Schema({
  _id: { type: Schema.Types.ObjectId }, 
  text: { type: String },
  imageUrl: { type: String, default: null },
  order: { type: Number, default: 0 },
});


const SnapshotQuestionSchema = new Schema({
  questionId: { type: Schema.Types.ObjectId, ref: "Question", required: true },
  title: { type: String },
  description: { type: String },
  type: { type: String },
  choices: [SnapshotChoiceSchema],
  points: { type: Number, default: 1 },
  difficulty: { type: String },
  correctAnswer: { type: Schema.Types.Mixed, default: null },
  acceptableAnswers: [{ text: String, regex: Boolean, caseSensitive: Boolean }],

  testCases: [{ input: String, expectedOutput: String, weight: Number, hidden: Boolean }],
  requiresManualGrading: { type: Boolean, default: false },
});


const StudentAnswerSchema = new Schema({
  selectedChoice: { type: Schema.Types.ObjectId, default: null },
  selectedChoices: [{ type: Schema.Types.ObjectId }],
  text: { type: String, default: null },
  fileUrls: [{ type: String }],
  // code: {
  //   language: { type: String },
  //   source: { type: String },
  //   runId: { type: String },
  //   result: { type: Schema.Types.Mixed },
  // },
  mapping: [{ leftId: Schema.Types.ObjectId, rightId: Schema.Types.ObjectId }], 
  blanks: [{ index: Number, text: String }],
  raw: { type: Schema.Types.Mixed, default: null },
});

const QuestionAttemptSchema = new Schema({
  snapshot: { type: SnapshotQuestionSchema, required: true },
  answer: { type: StudentAnswerSchema, default: () => ({}) },
  autoScore: { type: Number, default: 0 },
  manualScore: { type: Number, default: 0 },
  maxScore: { type: Number, default: 0 },
  graded: { type: Boolean, default: false },
  needsManualGrading: { type: Boolean, default: false },
  gradedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
  gradeComment: { type: String, default: null },
});

const AttemptSchema = new Schema(
  {
    quiz: { type: Schema.Types.ObjectId, ref: "Quiz", required: true },
    student: { type: Schema.Types.ObjectId, ref: "User", required: true },
    startedAt: { type: Date, default: Date.now },
    submittedAt: { type: Date, default: null },
    status: { type: String, enum: ["in-progress", "submitted", "auto-submitted"], default: "in-progress" },
    questions: [QuestionAttemptSchema],
    totalAutoScore: { type: Number, default: 0 },
    totalManualScore: { type: Number, default: 0 },
    totalScore: { type: Number, default: 0 },
    maxScore: { type: Number, default: 0 },
    timeTakenSeconds: { type: Number, default: 0 },
    ipAddress: { type: String, default: null },
    userAgent: { type: String, default: null },
    proctorEvents: [{ type: Schema.Types.ObjectId, ref: "ProctorEvent" }],
    suspicionScore: { type: Number, default: 0 },
    isFlagged: { type: Boolean, default: false },
    categoryScores: { type: Schema.Types.Mixed, default: {} },
    meta: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

AttemptSchema.index({ quiz: 1, student: 1, createdAt: -1 });


AttemptSchema.methods.computeAutoGrade = function () {
  let totalAuto = 0;
  let totalMax = 0;

  this.questions.forEach((qAttempt) => {
    const snapshot = qAttempt.snapshot;
    qAttempt.maxScore = snapshot.points || 1;
    totalMax += qAttempt.maxScore;

    if (snapshot.requiresManualGrading) {
      qAttempt.needsManualGrading = true;
      qAttempt.autoScore = 0;
      return;
    }

    let auto = 0;

    switch (snapshot.type) {
      case "mcq": {
        const selectedId = qAttempt.answer?.selectedChoice;
        const correctIndex = snapshot.correctAnswer;

        const correctChoice = (snapshot.choices && typeof correctIndex === "number") ? snapshot.choices[correctIndex] : null;
        const correctChoiceId = correctChoice ? correctChoice._id : null;
        if (selectedId && correctChoiceId && String(selectedId) === String(correctChoiceId)) {
          auto = qAttempt.maxScore;
        }
        break;
      }

      case "true_false": {
        const expected = snapshot.correctAnswer; 
        
        const studentAnswer = (qAttempt.answer?.text || "").trim().toLowerCase(); 

        if (studentAnswer === "true" && expected === true) {
          auto = qAttempt.maxScore;
        } else if (studentAnswer === "false" && expected === false) {
          auto = qAttempt.maxScore;
        }
        break;
      }

      case "checkbox": {
        const selected = Array.isArray(qAttempt.answer?.selectedChoices) ? qAttempt.answer.selectedChoices.map(String) : [];
        const correctIndices = Array.isArray(snapshot.correctAnswer) ? snapshot.correctAnswer : [];

        const expectedIds = (snapshot.choices || [])
          .filter((choice, index) => correctIndices.includes(index))
          .map(choice => String(choice._id));
        
        if (expectedIds.length > 0) {
          const correctSelected = selected.filter((id) => expectedIds.includes(id));
          const incorrectSelected = selected.filter((id) => !expectedIds.includes(id));

          const correctFraction = correctSelected.length / expectedIds.length;
          const penalty = incorrectSelected.length / expectedIds.length / 2;

          const fraction = Math.max(0, correctFraction - penalty);
          auto = Math.round(qAttempt.maxScore * fraction * 100) / 100;
        }
        break;
      }

      case "drag_drop": {
        const submittedIds = Array.isArray(qAttempt.answer?.selectedChoices) 
          ? qAttempt.answer.selectedChoices.map(String) 
          : [];
        
        const correctIds = (snapshot.choices || [])
          .sort((a, b) => a.order - b.order)
          .map(choice => String(choice._id));

        if (submittedIds.length === correctIds.length) {
          let isCorrect = true;
          for (let i = 0; i < correctIds.length; i++) {
            if (submittedIds[i] !== correctIds[i]) {
              isCorrect = false;
              break;
            }
          }
          
          if (isCorrect) {
            auto = qAttempt.maxScore;
          }
        }
        break;
      }
      // case "short_answer": {
      //   const txt = (qAttempt.answer?.text || "").trim();

      //   if (snapshot.acceptableAnswers && snapshot.acceptableAnswers.length) {
      //     const matched = snapshot.acceptableAnswers.some((a) => {
      //       if (a.regex) {
      //         try {
      //           const re = new RegExp(a.text, a.caseSensitive ? "" : "i");
      //           return re.test(txt);
      //         } catch {
      //           return false;
      //         }
      //       } else {
      //         if (a.caseSensitive) return a.text === txt;
      //         return a.text.toLowerCase() === txt.toLowerCase();
      //       }
      //     });
      //     if (matched) auto = qAttempt.maxScore;
      //   } else {
      //     qAttempt.needsManualGrading = true;
      //   }
      //   break;
      // }


      // case "code": {
      //   const result = qAttempt.answer?.code?.result;
      //   if (result && Array.isArray(result.testcases)) {
      //     let sum = 0, totalW = 0;
      //     result.testcases.forEach((t) => {
      //       sum += t.passed ? (t.weight || 1) : 0;
      //       totalW += t.weight || 1;
      //     });
      //     if (totalW > 0) auto = (qAttempt.maxScore * sum) / totalW;
      //   } else {
      //     qAttempt.needsManualGrading = true;
      //   }
      //   break;
      // }

      default:
        qAttempt.needsManualGrading = true;
        break;
    }

    qAttempt.autoScore = Math.round(auto * 100) / 100;
    totalAuto += qAttempt.autoScore;
  });

  this.totalAutoScore = Math.round(totalAuto * 100) / 100;
  this.maxScore = Math.round(totalMax * 100) / 100;
  this.totalScore = Math.round((this.totalAutoScore + (this.totalManualScore || 0)) * 100) / 100;
  return this;
};



export default model("Attempt", AttemptSchema);
