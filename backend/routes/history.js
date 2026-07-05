const express = require("express");
const Interview = require("../models/Interview");
const { protect } = require("../middleware/auth");

const router = express.Router();

// @route   GET /api/history
// @desc    Get the current user's interview history, with optional search + pagination
// @access  Private
// Query params: search (matches jobRole), type, page, limit
router.get("/", protect, async (req, res, next) => {
  try {
    const { search = "", type, page = 1, limit = 10 } = req.query;

    const query = { user: req.user._id, status: "completed" };
    if (search) query.jobRole = { $regex: search, $options: "i" };
    if (type) query.interviewType = type;

    const skip = (Number(page) - 1) * Number(limit);

    const [interviews, total] = await Promise.all([
      Interview.find(query).sort({ completedAt: -1 }).skip(skip).limit(Number(limit)),
      Interview.countDocuments(query),
    ]);

    res.json({
      success: true,
      interviews,
      pagination: { total, page: Number(page), pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
