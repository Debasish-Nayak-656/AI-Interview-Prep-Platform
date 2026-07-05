const express = require("express");
const Interview = require("../models/Interview");
const Report = require("../models/Report");
const User = require("../models/User");
const { protect } = require("../middleware/auth");

const router = express.Router();

// @route   GET /api/dashboard
// @desc    Aggregate stats, recent interviews, and performance trend for the dashboard
// @access  Private
router.get("/", protect, async (req, res, next) => {
  try {
    const userId = req.user._id;

    const [recentInterviews, allReports] = await Promise.all([
      Interview.find({ user: userId, status: "completed" }).sort({ completedAt: -1 }).limit(5),
      Report.find({ user: userId }).sort({ createdAt: 1 }),
    ]);

    // Performance graph data: [{ date, score }]
    const performanceTrend = allReports.map((r) => ({
      date: r.createdAt,
      score: r.overallScore,
    }));

    // Aggregate strengths/weaknesses frequency across all reports
    const strengthCount = {};
    const weaknessCount = {};
    allReports.forEach((r) => {
      r.strengths.forEach((s) => (strengthCount[s] = (strengthCount[s] || 0) + 1));
      r.weaknesses.forEach((w) => (weaknessCount[w] = (weaknessCount[w] || 0) + 1));
    });

    const topStrengths = Object.entries(strengthCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([label]) => label);

    const topWeaknesses = Object.entries(weaknessCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([label]) => label);

    res.json({
      success: true,
      stats: req.user.stats,
      recentInterviews,
      performanceTrend,
      topStrengths,
      topWeaknesses,
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/dashboard/leaderboard
// @desc    Top users ranked by average score (only opted-in fields are exposed)
// @access  Private
router.get("/leaderboard", protect, async (req, res, next) => {
  try {
    const topUsers = await User.find({ "stats.totalInterviews": { $gt: 0 } })
      .sort({ "stats.averageScore": -1 })
      .limit(20)
      .select("name avatar stats.averageScore stats.totalInterviews");

    res.json({ success: true, leaderboard: topUsers });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/dashboard/daily-challenge
// @desc    Returns a deterministic "question of the day" plus career tip
// @access  Private
router.get("/daily-challenge", protect, async (req, res, next) => {
  try {
    const dailyQuestions = [
      { type: "hr", questionText: "Tell me about a time you handled conflicting priorities under a tight deadline." },
      { type: "technical", questionText: "Explain the difference between REST and GraphQL, and when you'd choose one over the other." },
      { type: "behavioral", questionText: "Describe a situation where you received difficult feedback. How did you respond?" },
      { type: "technical", questionText: "What is the time complexity of a binary search, and why?" },
      { type: "hr", questionText: "Why do you want to work in this role, and what makes you a strong fit?" },
    ];
    const careerTips = [
      "Practice the STAR method (Situation, Task, Action, Result) for behavioral questions.",
      "Research the company's recent news and products before every interview.",
      "Keep technical answers structured: define, explain trade-offs, then give an example.",
      "Record yourself answering questions out loud to catch filler words and pacing issues.",
      "Prepare 2-3 thoughtful questions to ask the interviewer at the end.",
    ];

    // Deterministic pick based on day-of-year so it's the same for everyone all day
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000
    );

    res.json({
      success: true,
      question: dailyQuestions[dayOfYear % dailyQuestions.length],
      careerTip: careerTips[dayOfYear % careerTips.length],
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
