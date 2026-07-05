"use client";

import { useEffect, useState } from "react";
import { Trophy, Lightbulb, User as UserIcon } from "lucide-react";
import toast from "react-hot-toast";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Card } from "@/components/ui/Card";
import Skeleton from "@/components/ui/Skeleton";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";

interface LeaderboardUser {
  _id: string;
  name: string;
  stats: { averageScore: number; totalInterviews: number };
}

export default function ProfilePage() {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [daily, setDaily] = useState<{ question: any; careerTip: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [lbRes, dailyRes] = await Promise.all([
          api.get("/dashboard/leaderboard"),
          api.get("/dashboard/daily-challenge"),
        ]);
        setLeaderboard(lbRes.data.leaderboard);
        setDaily(dailyRes.data);
      } catch (err: any) {
        toast.error("Failed to load some profile data");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <ProtectedRoute>
      <div className="max-w-3xl mx-auto space-y-6">
        <Card className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white">
            <UserIcon size={28} />
          </div>
          <div>
            <h1 className="text-xl font-bold">{user?.name}</h1>
            <p className="text-sm text-slate-500">{user?.email}</p>
          </div>
        </Card>

        <Card className="grid grid-cols-3 text-center divide-x divide-white/30 dark:divide-white/10">
          <div>
            <p className="text-2xl font-bold">{user?.stats.totalInterviews ?? 0}</p>
            <p className="text-xs text-slate-500">Interviews</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{user?.stats.averageScore ?? 0}</p>
            <p className="text-xs text-slate-500">Avg Score</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{user?.stats.bestScore ?? 0}</p>
            <p className="text-xs text-slate-500">Best Score</p>
          </div>
        </Card>

        {loading ? (
          <Skeleton className="h-40 w-full" />
        ) : (
          daily && (
            <Card className="space-y-3">
              <h2 className="font-semibold flex items-center gap-2 text-primary-600">
                🔥 Daily Interview Challenge
              </h2>
              <p className="text-sm p-3 rounded-xl bg-white/40 dark:bg-white/5">
                <span className="text-xs uppercase text-slate-500 block mb-1">{daily.question.type}</span>
                {daily.question.questionText}
              </p>
              <div className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                <Lightbulb size={16} className="text-amber-500 mt-0.5 shrink-0" />
                <p><span className="font-medium">Career Tip:</span> {daily.careerTip}</p>
              </div>
            </Card>
          )
        )}

        <Card>
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <Trophy size={18} className="text-amber-500" /> Leaderboard
          </h2>
          {loading ? (
            <Skeleton className="h-40 w-full" />
          ) : leaderboard.length === 0 ? (
            <p className="text-sm text-slate-500">No ranked users yet.</p>
          ) : (
            <div className="space-y-2">
              {leaderboard.map((u, idx) => (
                <div
                  key={u._id}
                  className={`flex items-center justify-between p-3 rounded-xl ${
                    u._id === user?._id ? "bg-primary-500/10 border border-primary-500/30" : "bg-white/40 dark:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 text-center font-bold text-slate-400">{idx + 1}</span>
                    <span className="font-medium text-sm">{u.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-primary-600">
                    {u.stats.averageScore}/10 · {u.stats.totalInterviews} interviews
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </ProtectedRoute>
  );
}
