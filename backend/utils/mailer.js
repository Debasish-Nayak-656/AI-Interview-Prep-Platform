const nodemailer = require("nodemailer");

/**
 * Sends an interview report PDF as an email attachment.
 * Requires SMTP_* environment variables to be configured.
 */
async function sendReportEmail({ to, subject, text, attachmentPath }) {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
    throw new Error("Email is not configured on this server. Set SMTP_* env vars.");
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: `"AI Interview Platform" <${process.env.SMTP_USER}>`,
    to,
    subject,
    text,
    attachments: attachmentPath ? [{ filename: "interview-report.pdf", path: attachmentPath }] : [],
  });
}

module.exports = { sendReportEmail };
