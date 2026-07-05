const fs = require("fs");
const pdfParse = require("pdf-parse");

/**
 * Extracts raw text content from an uploaded PDF resume.
 * @param {string} filePath - absolute path to the uploaded PDF on disk
 * @returns {Promise<string>} extracted text
 */
async function extractTextFromPDF(filePath) {
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdfParse(dataBuffer);
  return data.text.replace(/\s+/g, " ").trim();
}

module.exports = { extractTextFromPDF };
