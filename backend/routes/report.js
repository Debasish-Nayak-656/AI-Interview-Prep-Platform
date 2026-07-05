const express = require("express");
const path = require("path");
const Report = require("../models/Report");
const Interview = require("../models/Interview");
const Question = require("../models/Question");
const { protect } = require("../middleware/auth");
const { sendReportEmail } = require("../utils/mailer");

const router = express.Router();

// @route   GET /api/report/:id
// @desc    Get the full report for an interview (id = interview id)
// @access  Private
router.get("/:id", protect, async (req, res, next) => {
  try {
    const interview = await Interview.findOne({ _id: req.params.id, user: req.user._id });
    if (!interview) return res.status(404).json({ success: false, message: "Interview not found" });

    const report = await Report.findOne({ interview: interview._id });
    const questions = await Question.find({ interview: interview._id }).sort({ order: 1 });

    if (!report) return res.status(404).json({ success: false, message: "Report not yet generated" });

    res.json({ success: true, interview, report, questions });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/report/:id/download
// @desc    Download the PDF version of the report
// @access  Private
router.get("/:id/download", protect, async (req, res, next) => {
  try {
    const interview = await Interview.findOne({ _id: req.params.id, user: req.user._id });
    if (!interview) return res.status(404).json({ success: false, message: "Interview not found" });

    const report = await Report.findOne({ interview: interview._id });
    if (!report || !report.pdfPath) {
      return res.status(404).json({ success: false, message: "PDF report not available" });
    }

    res.download(path.resolve(report.pdfPath), `interview-report-${interview._id}.pdf`);
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/report/:id/email
// @desc    Email the PDF report to a given address
// @access  Private
router.post("/:id/email", protect, async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: "Recipient email is required" });

    const interview = await Interview.findOne({ _id: req.params.id, user: req.user._id });
    if (!interview) return res.status(404).json({ success: false, message: "Interview not found" });

    const report = await Report.findOne({ interview: interview._id });
    if (!report || !report.pdfPath) {
      return res.status(404).json({ success: false, message: "PDF report not available" });
    }

    await sendReportEmail({
      to: email,
      subject: `Your Interview Report - ${interview.jobRole}`,
      text: `Attached is your AI interview report for the ${interview.jobRole} interview. Overall score: ${report.overallScore}/10.`,
      attachmentPath: report.pdfPath,
    });

    res.json({ success: true, message: "Report emailed successfully" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
