const mongoose = require("mongoose");

const ResumeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    fileName: { type: String, required: true },
    filePath: { type: String, required: true },
    extractedText: {
      type: String,
      default: "",
    },
    // Lightweight structured info pulled from the resume text via Gemini
    parsedSummary: {
      skills: [{ type: String }],
      experienceYears: { type: Number, default: 0 },
      role: { type: String, default: "" },
      education: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Resume", ResumeSchema);
