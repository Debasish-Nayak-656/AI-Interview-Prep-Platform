"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Card, ScoreBadge } from "@/components/ui/Card";
import Skeleton from "@/components/ui/Skeleton";
import api from "@/lib/api";
import { formatDate, Interview } from "@/lib/utils";

export default function HistoryPage() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/history", { params: { search, type, page, limit: 8 } });
      setInterviews(data.interviews);
      setPages(data.pagination.pages || 1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(loadHistory, 300); // debounce search
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, type, page]);

  return (
    <ProtectedRoute>
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Interview History</h1>

        <Card className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              placeholder="Search by job role..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="glass-input pl-9"
            />
          </div>
          <select
            value={type}
            onChange={(e) => { setType(e.target.value); setPage(1); }}
            className="glass-input sm:w-48"
          >
            <option value="">All types</option>
            <option value="technical">Technical</option>
            <option value="hr">HR</option>
            <option value="behavioral">Behavioral</option>
            <option value="mixed">Mixed</option>
          </select>
        </Card>

        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
          </div>
        ) : interviews.length === 0 ? (
          <p className="text-center text-slate-500 py-10">No interviews found.</p>
        ) : (
          <div className="space-y-3">
            {interviews.map((iv) => (
              <Link
                key={iv._id}
                href={`/results/${iv._id}`}
                className="glass-card p-4 flex items-center justify-between hover:bg-white/70 dark:hover:bg-white/10 transition"
              >
                <div>
                  <p className="font-medium">{iv.jobRole}</p>
                  <p className="text-xs text-slate-500 capitalize">
                    {iv.interviewType} · {iv.experienceLevel} · {formatDate(iv.completedAt || iv.createdAt)}
                  </p>
                </div>
                <ScoreBadge score={iv.overallScore} />
              </Link>
            ))}
          </div>
        )}

        {pages > 1 && (
          <div className="flex justify-center gap-2">
            {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-9 h-9 rounded-lg text-sm ${p === page ? "bg-primary-600 text-white" : "glass-card"}`}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
