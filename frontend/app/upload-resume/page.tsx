"use client";

import { useState, useEffect, useRef } from "react";
import { UploadCloud, FileText, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Card } from "@/components/ui/Card";
import api from "@/lib/api";

interface ResumeItem {
  _id: string;
  fileName: string;
  parsedSummary: { role: string; skills: string[]; experienceYears: number };
  createdAt: string;
}

export default function UploadResumePage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [resumes, setResumes] = useState<ResumeItem[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const loadResumes = async () => {
    try {
      const { data } = await api.get("/resume");
      setResumes(data.resumes);
    } catch {
      // silent - non-critical
    }
  };

  useEffect(() => {
    loadResumes();
  }, []);

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a PDF resume first");
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("resume", file);
      const { data } = await api.post("/resume/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Resume uploaded and parsed successfully!");
      setFile(null);
      if (inputRef.current) inputRef.current.value = "";
      await loadResumes();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="max-w-2xl mx-auto space-y-8">
        <h1 className="text-2xl font-bold">Upload Resume</h1>

        <Card>
          <label
            htmlFor="resume-file"
            className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-primary-400/50 rounded-xl p-10 cursor-pointer hover:bg-primary-500/5 transition"
          >
            <UploadCloud className="text-primary-500" size={32} />
            <p className="text-sm font-medium">{file ? file.name : "Click to select a PDF resume"}</p>
            <p className="text-xs text-slate-500">Max size 5MB · PDF only</p>
            <input
              id="resume-file"
              ref={inputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </label>

          <button onClick={handleUpload} disabled={uploading} className="btn-primary w-full mt-4">
            {uploading ? "Uploading & analyzing with AI..." : "Upload Resume"}
          </button>
        </Card>

        <Card>
          <h2 className="font-semibold mb-4">Your Uploaded Resumes</h2>
          {resumes.length === 0 ? (
            <p className="text-sm text-slate-500">No resumes uploaded yet.</p>
          ) : (
            <div className="space-y-3">
              {resumes.map((r) => (
                <div key={r._id} className="flex items-start gap-3 p-3 rounded-xl bg-white/40 dark:bg-white/5">
                  <FileText className="text-primary-500 mt-0.5" size={18} />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{r.fileName}</p>
                    <p className="text-xs text-slate-500">
                      Role: {r.parsedSummary?.role || "N/A"} · {r.parsedSummary?.experienceYears || 0} yrs exp
                    </p>
                    {r.parsedSummary?.skills?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {r.parsedSummary.skills.slice(0, 8).map((s) => (
                          <span key={s} className="text-[11px] px-2 py-0.5 rounded-full bg-primary-500/10 text-primary-600">
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <CheckCircle2 className="text-emerald-500" size={18} />
                </div>
              ))}
            </div>
          )}
        </Card>

        <button onClick={() => router.push("/create-interview")} className="btn-secondary w-full">
          Continue to Create Interview →
        </button>
      </div>
    </ProtectedRoute>
  );
}
