const express = require("express");
const Resume = require("../models/Resume");
const { protect } = require("../middleware/auth");
const upload = require("../middleware/upload");
const { extractTextFromPDF } = require("../utils/resumeParser");
const { parseResumeWithAI } = require("../utils/gemini");

const router = express.Router();

// @route   POST /api/resume/upload
// @desc    Upload a PDF resume, extract text, and store an AI-parsed summary
// @access  Private
router.post("/upload", protect, upload.single("resume"), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No resume file uploaded" });
    }

    const extractedText = await extractTextFromPDF(req.file.path);

    let parsedSummary = { skills: [], experienceYears: 0, role: "", education: "" };
    try {
      parsedSummary = await parseResumeWithAI(extractedText);
    } catch (aiErr) {
      console.warn("Resume AI parsing failed, storing raw text only:", aiErr.message);
    }

    const resume = await Resume.create({
      user: req.user._id,
      fileName: req.file.originalname,
      filePath: req.file.path,
      extractedText,
      parsedSummary,
    });

    res.status(201).json({ success: true, resume });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/resume
// @desc    Get all resumes uploaded by the current user
// @access  Private
router.get("/", protect, async (req, res, next) => {
  try {
    const resumes = await Resume.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, resumes });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
