"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Trophy, ListChecks, TrendingUp, Flame } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Card, StatCard, ScoreBadge } from "@/components/ui/Card";
import Skeleton from "@/components/ui/Skeleton";
import api from "@/lib/api";
import { formatDate } from "@/lib/utils";
import toast from "react-hot-toast";

interface DashboardData {
  stats: {
    totalInterviews: number;
    averageScore: number;
    bestScore: number;
    streak: number;
  };
  recentInterviews: any[];
  performanceTrend: { date: string; score: number }[];
  topStrengths: string[];
  topWeaknesses: string[];
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/dashboard");
        setData(res.data);
      } catch (err: any) {
        toast.error(err?.response?.data?.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <ProtectedRoute>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <Link href="/create-interview" className="btn-primary">Start New Interview</Link>
        </div>

        {loading || !data ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
          </div>
        ) : (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Total Interviews" value={data.stats.totalInterviews} icon={<ListChecks size={20} />} />
              <StatCard label="Average Score" value={`${data.stats.averageScore}/10`} icon={<TrendingUp size={20} />} />
              <StatCard label="Best Score" value={`${data.stats.bestScore}/10`} icon={<Trophy size={20} />} />
              <StatCard label="Current Streak" value={`${data.stats.streak} days`} icon={<Flame size={20} />} />
            </div>

            <Card>
              <h2 className="font-semibold mb-4">Performance Trend</h2>
              {data.performanceTrend.length === 0 ? (
                <p className="text-sm text-slate-500">Complete an interview to see your trend here.</p>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={data.performanceTrend.map((p) => ({ ...p, date: formatDate(p.date) }))}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="date" fontSize={12} />
                    <YAxis domain={[0, 10]} fontSize={12} />
                    <Tooltip />
                    <Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <h2 className="font-semibold mb-3 text-emerald-600">Top Strengths</h2>
                {data.topStrengths.length === 0 ? (
                  <p className="text-sm text-slate-500">No data yet.</p>
                ) : (
                  <ul className="space-y-2 text-sm">
                    {data.topStrengths.map((s) => <li key={s} className="flex gap-2"><span>✅</span>{s}</li>)}
                  </ul>
                )}
              </Card>
              <Card>
                <h2 className="font-semibold mb-3 text-rose-500">Areas to Improve</h2>
                {data.topWeaknesses.length === 0 ? (
                  <p className="text-sm text-slate-500">No data yet.</p>
                ) : (
                  <ul className="space-y-2 text-sm">
                    {data.topWeaknesses.map((w) => <li key={w} className="flex gap-2"><span>⚠️</span>{w}</li>)}
                  </ul>
                )}
              </Card>
            </div>

            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold">Recent Interviews</h2>
                <Link href="/history" className="text-sm text-primary-600">View all</Link>
              </div>
              {data.recentInterviews.length === 0 ? (
                <p className="text-sm text-slate-500">No interviews yet. Start your first one!</p>
              ) : (
                <div className="space-y-3">
                  {data.recentInterviews.map((iv) => (
                    <Link
                      key={iv._id}
                      href={`/results/${iv._id}`}
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-white/40 dark:hover:bg-white/5 transition"
                    >
                      <div>
                        <p className="font-medium">{iv.jobRole}</p>
                        <p className="text-xs text-slate-500">{iv.interviewType} · {formatDate(iv.completedAt)}</p>
                      </div>
                      <ScoreBadge score={iv.overallScore} />
                    </Link>
                  ))}
                </div>
              )}
            </Card>
          </>
        )}
      </div>
    </ProtectedRoute>
  );
}
