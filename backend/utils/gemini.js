const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const MODEL_NAME = process.env.GEMINI_MODEL || "gemini-1.5-flash";

/**
 * Calls Gemini with a prompt that must return ONLY JSON, and safely parses it.
 * Strips markdown code fences in case the model wraps the JSON in ```json ... ```.
 */
async function generateJSON(prompt) {
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });
  const result = await model.generateContent(prompt);
  const rawText = result.response.text();
  const cleaned = rawText.replace(/```json/g, "").replace(/```/g, "").trim();

  try {
    return JSON.parse(cleaned);
  } catch (err) {
    throw new Error(`Gemini returned non-JSON response: ${cleaned.slice(0, 300)}`);
  }
}

/**
 * Generates a structured summary from raw resume text (skills, role, years, education).
 */
async function parseResumeWithAI(resumeText) {
  const prompt = `
You are a resume parsing engine. Analyze the resume text below and return ONLY valid JSON
(no markdown, no commentary) with this exact shape:

{
  "skills": ["skill1", "skill2", ...],
  "experienceYears": <number>,
  "role": "<most likely current/target job role>",
  "education": "<highest degree and field>"
}

Resume text:
"""
${resumeText.slice(0, 6000)}
"""
`;
  return generateJSON(prompt);
}

/**
 * Generates 10-15 role-specific interview questions.
 * If resumeText is provided, questions are tailored to the candidate's background.
 */
async function generateInterviewQuestions({ jobRole, experienceLevel, interviewType, resumeText }) {
  const prompt = `
You are an expert technical interviewer. Generate between 10 and 15 interview questions for:

- Job Role: ${jobRole}
- Experience Level: ${experienceLevel}
- Interview Type: ${interviewType} (technical, hr, behavioral, or mixed)
${resumeText ? `- Candidate resume excerpt (tailor some questions to this background):\n"""${resumeText.slice(0, 4000)}"""` : ""}

Rules:
- Questions must be specific to the role and experience level, not generic.
- If interviewType is "mixed", blend technical, HR, and behavioral questions.
- Order questions from warm-up to more challenging.
- Return ONLY valid JSON, no markdown, in this exact shape:

{
  "questions": [
    { "questionText": "...", "type": "technical" },
    { "questionText": "...", "type": "hr" }
  ]
}
`;
  const data = await generateJSON(prompt);
  return data.questions || [];
}

/**
 * Generates a single contextual follow-up question based on the candidate's last answer.
 */
async function generateFollowUpQuestion({ jobRole, originalQuestion, candidateAnswer }) {
  const prompt = `
You are interviewing a candidate for the role of ${jobRole}.
Original question: "${originalQuestion}"
Candidate's answer: "${candidateAnswer}"

Generate ONE short, natural follow-up question that probes deeper into their answer
(e.g., asks for a specific example, clarifies a claim, or tests depth of knowledge).

Return ONLY valid JSON in this shape:
{ "followUpQuestion": "..." }
`;
  const data = await generateJSON(prompt);
  return data.followUpQuestion || null;
}

/**
 * Evaluates a single answer across 5 dimensions and returns a score + feedback.
 */
async function evaluateAnswer({ jobRole, questionText, answerText }) {
  const prompt = `
You are an expert interview evaluator for the role of ${jobRole}.

Question: "${questionText}"
Candidate's Answer: "${answerText || "(no answer provided)"}"

Evaluate the answer and return ONLY valid JSON in this exact shape:
{
  "score": <0-10 overall score>,
  "technicalAccuracy": <0-10>,
  "communication": <0-10>,
  "clarity": <0-10>,
  "problemSolving": <0-10>,
  "confidence": <0-10>,
  "feedback": "<2-4 sentences of specific, constructive feedback>",
  "strengths": ["...", "..."],
  "improvements": ["...", "..."]
}

If the answer is empty or irrelevant, score all dimensions low and say so in the feedback.
`;
  return generateJSON(prompt);
}

/**
 * Produces the final aggregated report (summary, strengths/weaknesses, suggestions)
 * once all questions in an interview have been evaluated.
 */
async function generateFinalReport({ jobRole, questionEvaluations }) {
  const prompt = `
You are summarizing a completed interview for a candidate applying for: ${jobRole}.

Here are the per-question evaluations (JSON array):
${JSON.stringify(questionEvaluations).slice(0, 6000)}

Return ONLY valid JSON in this exact shape:
{
  "summary": "<3-5 sentence overall summary of performance>",
  "strengths": ["...", "...", "..."],
  "weaknesses": ["...", "...", "..."],
  "improvementSuggestions": ["...", "...", "..."]
}
`;
  return generateJSON(prompt);
}

module.exports = {
  parseResumeWithAI,
  generateInterviewQuestions,
  generateFollowUpQuestion,
  evaluateAnswer,
  generateFinalReport,
};
