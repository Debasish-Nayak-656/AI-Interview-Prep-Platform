const mongoose = require("mongoose");

/**
 * A generated report for a completed interview — the aggregated,
 * human-readable summary used on the Results page and in the PDF export.
 */
const ReportSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    interview: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Interview",
      required: true,
      unique: true,
    },
    overallScore: { type: Number, required: true },
    averageBreakdown: {
      technicalAccuracy: { type: Number, default: 0 },
      communication: { type: Number, default: 0 },
      clarity: { type: Number, default: 0 },
      problemSolving: { type: Number, default: 0 },
      confidence: { type: Number, default: 0 },
    },
    strengths: [{ type: String }],
    weaknesses: [{ type: String }],
    improvementSuggestions: [{ type: String }],
    summary: { type: String, default: "" },
    pdfPath: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Report", ReportSchema);
