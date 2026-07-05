"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";
import { Download, Mail, CheckCircle2, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Card, ScoreBadge } from "@/components/ui/Card";
import Skeleton from "@/components/ui/Skeleton";
import api from "@/lib/api";
import { Interview, Question, Report } from "@/lib/utils";

export default function ResultsPage() {
  const { id } = useParams<{ id: string }>();
  const [interview, setInterview] = useState<Interview | null>(null);
  const [report, setReport] = useState<Report | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get(`/report/${id}`);
        setInterview(data.interview);
        setReport(data.report);
        setQuestions(data.questions);
      } catch (err: any) {
        toast.error(err?.response?.data?.message || "Failed to load report");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleDownload = () => {
    window.open(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/report/${id}/download`, "_blank");
  };

  const handleEmail = async () => {
    if (!email) return toast.error("Enter an email address");
    setSendingEmail(true);
    try {
      await api.post(`/report/${id}/email`, { email });
      toast.success(`Report sent to ${email}`);
      setEmail("");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to send email");
    } finally {
      setSendingEmail(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="space-y-4 max-w-3xl mx-auto">
          <Skeleton className="h-10 w-1/2" />
          <Skeleton className="h-64 w-full" />
        </div>
      </ProtectedRoute>
    );
  }

  if (!report || !interview) {
    return (
      <ProtectedRoute>
        <p className="text-center text-slate-500">Report not found.</p>
      </ProtectedRoute>
    );
  }

  const radarData = Object.entries(report.averageBreakdown).map(([key, value]) => ({
    subject: key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase()),
    score: value,
    fullMark: 10,
  }));

  return (
    <ProtectedRoute>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <p className="text-sm text-slate-500">{interview.jobRole} · {interview.interviewType}</p>
          <h1 className="text-4xl font-extrabold">
            <ScoreBadge score={report.overallScore} />
          </h1>
          <p className="text-slate-500">Overall Interview Score</p>
        </div>

        <div className="flex flex-wrap gap-3 justify-center">
          <button onClick={handleDownload} className="btn-primary flex items-center gap-2">
            <Download size={16} /> Download PDF Report
          </button>
        </div>

        <Card className="flex flex-col sm:flex-row gap-3 items-center">
          <input
            type="email"
            placeholder="Email the report to..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="glass-input flex-1"
          />
          <button onClick={handleEmail} disabled={sendingEmail} className="btn-secondary flex items-center gap-2 whitespace-nowrap">
            <Mail size={16} /> {sendingEmail ? "Sending..." : "Send Report"}
          </button>
        </Card>

        <Card>
          <h2 className="font-semibold mb-4">Skill-wise Breakdown</h2>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" fontSize={11} />
              <PolarRadiusAxis domain={[0, 10]} fontSize={10} />
              <Radar dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.4} />
            </RadarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h2 className="font-semibold mb-2">Summary</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">{report.summary}</p>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <h2 className="font-semibold mb-3 text-emerald-600 flex items-center gap-2">
              <CheckCircle2 size={18} /> Strengths
            </h2>
            <ul className="space-y-2 text-sm">
              {report.strengths.map((s) => <li key={s}>• {s}</li>)}
            </ul>
          </Card>
          <Card>
            <h2 className="font-semibold mb-3 text-rose-500 flex items-center gap-2">
              <AlertTriangle size={18} /> Improvement Suggestions
            </h2>
            <ul className="space-y-2 text-sm">
              {report.improvementSuggestions.map((s) => <li key={s}>• {s}</li>)}
            </ul>
          </Card>
        </div>

        <Card>
          <h2 className="font-semibold mb-4">Question-wise Scores</h2>
          <div className="space-y-4">
            {questions.map((q, idx) => (
              <div key={q._id} className="p-4 rounded-xl bg-white/40 dark:bg-white/5 space-y-1.5">
                <div className="flex justify-between items-start gap-4">
                  <p className="font-medium text-sm">Q{idx + 1}. {q.questionText}</p>
                  <ScoreBadge score={q.evaluation?.score ?? null} />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-medium">Your answer: </span>
                  {q.answerText || "(not answered)"}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  <span className="font-medium">Feedback: </span>
                  {q.evaluation?.feedback}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
