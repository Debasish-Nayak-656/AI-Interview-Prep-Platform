"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Sparkles, Mic, BarChart3, FileText } from "lucide-react";

const features = [
  {
    icon: <Sparkles className="text-primary-500" />,
    title: "AI-Generated Questions",
    desc: "Role-specific, experience-aware questions generated dynamically by Google Gemini.",
  },
  {
    icon: <Mic className="text-primary-500" />,
    title: "Voice or Text Answers",
    desc: "Answer naturally by typing or speaking — with a timer and live progress tracking.",
  },
  {
    icon: <BarChart3 className="text-primary-500" />,
    title: "Instant AI Evaluation",
    desc: "Get scored on technical accuracy, communication, clarity, problem solving, and confidence.",
  },
  {
    icon: <FileText className="text-primary-500" />,
    title: "Downloadable Reports",
    desc: "Every interview produces a detailed PDF report you can save or email to yourself.",
  },
];

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col items-center text-center gap-10 py-10">
      <div className="max-w-3xl space-y-6">
        <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight">
          Ace Your Next Interview with{" "}
          <span className="bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent">
            AI-Powered Practice
          </span>
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-300">
          Upload your resume, pick a role, and let our AI interviewer ask you real questions —
          then get instant, detailed feedback to help you improve.
        </p>
        <div className="flex justify-center gap-4">
          <Link href={user ? "/create-interview" : "/register"} className="btn-primary">
            {user ? "Start New Interview" : "Get Started Free"}
          </Link>
          <Link href={user ? "/dashboard" : "/login"} className="btn-secondary">
            {user ? "Go to Dashboard" : "Login"}
          </Link>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl">
        {features.map((f) => (
          <div key={f.title} className="glass-card p-6 text-left space-y-3">
            <div className="p-2.5 w-fit rounded-xl bg-primary-500/10">{f.icon}</div>
            <h3 className="font-semibold">{f.title}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
