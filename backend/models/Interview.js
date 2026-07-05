const mongoose = require("mongoose");

const InterviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    resume: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resume",
      default: null,
    },
    jobRole: { type: String, required: true },
    experienceLevel: {
      type: String,
      enum: ["fresher", "junior", "mid", "senior", "lead"],
      required: true,
    },
    interviewType: {
      type: String,
      enum: ["technical", "hr", "behavioral", "mixed"],
      required: true,
    },
    status: {
      type: String,
      enum: ["created", "in-progress", "completed", "abandoned"],
      default: "created",
    },
    totalQuestions: { type: Number, default: 0 },
    currentQuestionIndex: { type: Number, default: 0 },
    durationSeconds: { type: Number, default: 0 },
    overallScore: { type: Number, default: null }, // out of 10
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Interview", InterviewSchema);
