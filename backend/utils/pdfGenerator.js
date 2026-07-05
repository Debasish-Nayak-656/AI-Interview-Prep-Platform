const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const reportsDir = path.join(__dirname, "..", "uploads", "reports");
if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });

/**
 * Generates a PDF interview report and writes it to disk.
 * @returns {Promise<string>} absolute path of the generated PDF
 */
function generateReportPDF({ user, interview, questions, report }) {
  return new Promise((resolve, reject) => {
    const fileName = `report-${interview._id}.pdf`;
    const filePath = path.join(reportsDir, fileName);
    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // Header
    doc.fontSize(20).fillColor("#111").text("AI Interview Preparation Platform", { align: "center" });
    doc.moveDown(0.3);
    doc.fontSize(14).fillColor("#555").text("Interview Performance Report", { align: "center" });
    doc.moveDown();

    // Candidate info
    doc.fontSize(11).fillColor("#000");
    doc.text(`Candidate: ${user.name}`);
    doc.text(`Job Role: ${interview.jobRole}`);
    doc.text(`Experience Level: ${interview.experienceLevel}`);
    doc.text(`Interview Type: ${interview.interviewType}`);
    doc.text(`Date: ${new Date(interview.completedAt || interview.createdAt).toLocaleString()}`);
    doc.moveDown();

    // Overall score
    doc.fontSize(16).fillColor("#111").text(`Overall Score: ${report.overallScore}/10`, { underline: true });
    doc.moveDown(0.5);

    // Breakdown
    doc.fontSize(12).text("Score Breakdown:");
    doc.fontSize(10).fillColor("#333");
    Object.entries(report.averageBreakdown || {}).forEach(([key, value]) => {
      doc.text(`  • ${key}: ${value}/10`);
    });
    doc.moveDown();

    // Summary
    doc.fontSize(12).fillColor("#111").text("Summary:");
    doc.fontSize(10).fillColor("#333").text(report.summary || "N/A", { align: "justify" });
    doc.moveDown();

    // Strengths
    doc.fontSize(12).fillColor("#111").text("Strengths:");
    doc.fontSize(10).fillColor("#333");
    (report.strengths || []).forEach((s) => doc.text(`  • ${s}`));
    doc.moveDown();

    // Weaknesses
    doc.fontSize(12).fillColor("#111").text("Areas to Improve:");
    doc.fontSize(10).fillColor("#333");
    (report.weaknesses || []).forEach((w) => doc.text(`  • ${w}`));
    doc.moveDown();

    // Suggestions
    doc.fontSize(12).fillColor("#111").text("Improvement Suggestions:");
    doc.fontSize(10).fillColor("#333");
    (report.improvementSuggestions || []).forEach((s) => doc.text(`  • ${s}`));
    doc.moveDown();

    // Question-wise breakdown
    doc.addPage();
    doc.fontSize(16).fillColor("#111").text("Question-wise Evaluation", { underline: true });
    doc.moveDown();

    questions.forEach((q, idx) => {
      doc.fontSize(11).fillColor("#111").text(`Q${idx + 1}. ${q.questionText}`);
      doc.fontSize(10).fillColor("#555").text(`Your answer: ${q.answerText || "(not answered)"}`);
      doc.fontSize(10).fillColor("#333").text(`Score: ${q.evaluation?.score ?? "N/A"}/10`);
      doc.fontSize(10).fillColor("#333").text(`Feedback: ${q.evaluation?.feedback || "N/A"}`);
      doc.moveDown();
    });

    doc.end();

    stream.on("finish", () => resolve(filePath));
    stream.on("error", reject);
  });
}

module.exports = { generateReportPDF };
