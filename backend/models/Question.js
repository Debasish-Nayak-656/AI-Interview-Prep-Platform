const mongoose = require("mongoose");

/**
 * A single question within an interview, along with the candidate's
 * answer and the AI's evaluation of that answer.
 */
const QuestionSchema = new mongoose.Schema(
  {
    interview: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Interview",
      required: true,
      index: true,
    },
    order: { type: Number, required: true },
    questionText: { type: String, required: true },
    type: {
      type: String,
      enum: ["technical", "hr", "behavioral", "mixed"],
      required: true,
    },
    followUpOf: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      default: null,
    },
    answerText: { type: String, default: "" },
    answeredViaVoice: { type: Boolean, default: false },
    timeTakenSeconds: { type: Number, default: 0 },

    // AI evaluation
    evaluation: {
      score: { type: Number, min: 0, max: 10, default: null },
      technicalAccuracy: { type: Number, min: 0, max: 10, default: null },
      communication: { type: Number, min: 0, max: 10, default: null },
      clarity: { type: Number, min: 0, max: 10, default: null },
      problemSolving: { type: Number, min: 0, max: 10, default: null },
      confidence: { type: Number, min: 0, max: 10, default: null },
      feedback: { type: String, default: "" },
      strengths: [{ type: String }],
      improvements: [{ type: String }],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Question", QuestionSchema);
