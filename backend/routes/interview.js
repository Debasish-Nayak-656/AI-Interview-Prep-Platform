const express = require("express");
const Interview = require("../models/Interview");
const Question = require("../models/Question");
const Resume = require("../models/Resume");
const Report = require("../models/Report");
const User = require("../models/User");
const { protect } = require("../middleware/auth");
const {
  generateInterviewQuestions,
  generateFollowUpQuestion,
  evaluateAnswer,
  generateFinalReport,
} = require("../utils/gemini");
const { generateReportPDF } = require("../utils/pdfGenerator");

const router = express.Router();

// @route   POST /api/interview/create
// @desc    Create a new interview: generates 10-15 AI questions for the chosen role
// @access  Private
router.post("/create", protect, async (req, res, next) => {
  try {
    const { jobRole, experienceLevel, interviewType, resumeId } = req.body;

    if (!jobRole || !experienceLevel || !interviewType) {
      return res.status(400).json({
        success: false,
        message: "jobRole, experienceLevel, and interviewType are required",
      });
    }

    let resumeText = null;
    if (resumeId) {
      const resume = await Resume.findOne({ _id: resumeId, user: req.user._id });
      if (resume) resumeText = resume.extractedText;
    }

    const generatedQuestions = await generateInterviewQuestions({
      jobRole,
      experienceLevel,
      interviewType,
      resumeText,
    });

    if (!generatedQuestions.length) {
      return res.status(502).json({ success: false, message: "AI failed to generate questions. Please try again." });
    }

    const interview = await Interview.create({
      user: req.user._id,
      resume: resumeId || null,
      jobRole,
      experienceLevel,
      interviewType,
      status: "in-progress",
      totalQuestions: generatedQuestions.length,
    });

    const questionDocs = await Question.insertMany(
      generatedQuestions.map((q, idx) => ({
        interview: interview._id,
        order: idx,
        questionText: q.questionText,
        type: q.type || interviewType,
      }))
    );

    res.status(201).json({ success: true, interview, questions: questionDocs });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/interview/:id
// @desc    Get an interview and its questions (for the interview session page)
// @access  Private
router.get("/:id", protect, async (req, res, next) => {
  try {
    const interview = await Interview.findOne({ _id: req.params.id, user: req.user._id });
    if (!interview) {
      return res.status(404).json({ success: false, message: "Interview not found" });
    }
    const questions = await Question.find({ interview: interview._id }).sort({ order: 1 });
    res.json({ success: true, interview, questions });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/interview/:id/follow-up
// @desc    Generate an AI follow-up question based on the candidate's last answer
// @access  Private
router.post("/:id/follow-up", protect, async (req, res, next) => {
  try {
    const { questionId, answerText } = req.body;
    const interview = await Interview.findOne({ _id: req.params.id, user: req.user._id });
    if (!interview) return res.status(404).json({ success: false, message: "Interview not found" });

    const originalQuestion = await Question.findById(questionId);
    if (!originalQuestion) return res.status(404).json({ success: false, message: "Question not found" });

    const followUpText = await generateFollowUpQuestion({
      jobRole: interview.jobRole,
      originalQuestion: originalQuestion.questionText,
      candidateAnswer: answerText,
    });

    if (!followUpText) {
      return res.json({ success: true, followUp: null });
    }

    const maxOrder = await Question.countDocuments({ interview: interview._id });
    const followUpQuestion = await Question.create({
      interview: interview._id,
      order: maxOrder,
      questionText: followUpText,
      type: originalQuestion.type,
      followUpOf: originalQuestion._id,
    });

    interview.totalQuestions += 1;
    await interview.save();

    res.status(201).json({ success: true, followUp: followUpQuestion });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/interview/submit
// @desc    Submit an answer for a single question -> AI evaluates it immediately
// @access  Private
router.post("/submit", protect, async (req, res, next) => {
  try {
    const { questionId, answerText, answeredViaVoice, timeTakenSeconds } = req.body;

    const question = await Question.findById(questionId).populate("interview");
    if (!question) return res.status(404).json({ success: false, message: "Question not found" });
    if (String(question.interview.user) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: "Not authorized for this interview" });
    }

    const evaluation = await evaluateAnswer({
      jobRole: question.interview.jobRole,
      questionText: question.questionText,
      answerText,
    });

    question.answerText = answerText || "";
    question.answeredViaVoice = !!answeredViaVoice;
    question.timeTakenSeconds = timeTakenSeconds || 0;
    question.evaluation = evaluation;
    await question.save();

    await Interview.findByIdAndUpdate(question.interview._id, {
      $inc: { currentQuestionIndex: 1 },
    });

    res.json({ success: true, question });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/interview/:id/complete
// @desc    Finalize the interview: aggregate scores, generate AI report + PDF
// @access  Private
router.post("/:id/complete", protect, async (req, res, next) => {
  try {
    const interview = await Interview.findOne({ _id: req.params.id, user: req.user._id });
    if (!interview) return res.status(404).json({ success: false, message: "Interview not found" });

    const questions = await Question.find({ interview: interview._id }).sort({ order: 1 });
    const scored = questions.filter((q) => q.evaluation && q.evaluation.score !== null);

    if (!scored.length) {
      return res.status(400).json({ success: false, message: "No answered questions to evaluate" });
    }

    const avg = (key) =>
      Math.round(
        (scored.reduce((sum, q) => sum + (q.evaluation[key] || 0), 0) / scored.length) * 10
      ) / 10;

    const overallScore = avg("score");
    const averageBreakdown = {
      technicalAccuracy: avg("technicalAccuracy"),
      communication: avg("communication"),
      clarity: avg("clarity"),
      problemSolving: avg("problemSolving"),
      confidence: avg("confidence"),
    };

    const aiSummary = await generateFinalReport({
      jobRole: interview.jobRole,
      questionEvaluations: scored.map((q) => ({
        question: q.questionText,
        ...q.evaluation.toObject(),
      })),
    });

    const report = await Report.create({
      user: req.user._id,
      interview: interview._id,
      overallScore,
      averageBreakdown,
      strengths: aiSummary.strengths || [],
      weaknesses: aiSummary.weaknesses || [],
      improvementSuggestions: aiSummary.improvementSuggestions || [],
      summary: aiSummary.summary || "",
    });

    interview.status = "completed";
    interview.overallScore = overallScore;
    interview.completedAt = new Date();
    await interview.save();

    // Generate PDF report
    try {
      const pdfPath = await generateReportPDF({ user: req.user, interview, questions, report });
      report.pdfPath = pdfPath;
      await report.save();
    } catch (pdfErr) {
      console.warn("PDF generation failed:", pdfErr.message);
    }

    // Update user aggregate stats
    const user = await User.findById(req.user._id);
    const prevTotal = user.stats.totalInterviews;
    const newTotal = prevTotal + 1;
    const newAverage =
      Math.round(((user.stats.averageScore * prevTotal + overallScore) / newTotal) * 10) / 10;

    user.stats.totalInterviews = newTotal;
    user.stats.averageScore = newAverage;
    user.stats.bestScore = Math.max(user.stats.bestScore, overallScore);
    user.stats.lastInterviewDate = new Date();
    await user.save();

    res.json({ success: true, interview, report });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
