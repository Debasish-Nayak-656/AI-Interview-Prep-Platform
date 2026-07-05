import { type ClassValue, clsx } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatSeconds(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function scoreColor(score: number) {
  if (score >= 8) return "text-emerald-500";
  if (score >= 5) return "text-amber-500";
  return "text-rose-500";
}

// --- Shared domain types ---
export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  targetRole?: string;
  stats: {
    totalInterviews: number;
    averageScore: number;
    bestScore: number;
    streak: number;
    lastInterviewDate: string | null;
  };
}

export interface QuestionEvaluation {
  score: number | null;
  technicalAccuracy: number | null;
  communication: number | null;
  clarity: number | null;
  problemSolving: number | null;
  confidence: number | null;
  feedback: string;
  strengths: string[];
  improvements: string[];
}

export interface Question {
  _id: string;
  interview: string;
  order: number;
  questionText: string;
  type: "technical" | "hr" | "behavioral" | "mixed";
  answerText: string;
  answeredViaVoice: boolean;
  timeTakenSeconds: number;
  evaluation: QuestionEvaluation;
}

export interface Interview {
  _id: string;
  jobRole: string;
  experienceLevel: string;
  interviewType: "technical" | "hr" | "behavioral" | "mixed";
  status: "created" | "in-progress" | "completed" | "abandoned";
  totalQuestions: number;
  currentQuestionIndex: number;
  overallScore: number | null;
  completedAt: string | null;
  createdAt: string;
}

export interface Report {
  overallScore: number;
  averageBreakdown: {
    technicalAccuracy: number;
    communication: number;
    clarity: number;
    problemSolving: number;
    confidence: number;
  };
  strengths: string[];
  weaknesses: string[];
  improvementSuggestions: string[];
  summary: string;
}
