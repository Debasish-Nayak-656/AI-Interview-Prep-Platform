require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const path = require("path");
const connectDB = require("./config/db");
const { errorHandler, notFound } = require("./middleware/errorHandler");

// Routes
const authRoutes = require("./routes/auth");
const resumeRoutes = require("./routes/resume");
const interviewRoutes = require("./routes/interview");
const historyRoutes = require("./routes/history");
const reportRoutes = require("./routes/report");
const dashboardRoutes = require("./routes/dashboard");

connectDB();

const app = express();

// --- Core middleware ---
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== "production") app.use(morgan("dev"));

// Basic rate limiting to protect auth + AI endpoints from abuse
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api", apiLimiter);

// Serve uploaded files (resumes, generated PDF reports) statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// --- API routes ---
app.use("/api/auth", authRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/interview", interviewRoutes);
app.use("/api/history", historyRoutes);
app.use("/api/report", reportRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "AI Interview Platform API is running" });
});

// --- Error handling (must be last) ---
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV || "development"} mode`);
});

module.exports = app;
