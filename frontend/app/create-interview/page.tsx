"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Card } from "@/components/ui/Card";
import api from "@/lib/api";
import { createInterviewSchema, CreateInterviewInput } from "@/lib/validation";
import { cn } from "@/lib/utils";

const experienceLevels = ["fresher", "junior", "mid", "senior", "lead"] as const;
const interviewTypes = [
  { value: "technical", label: "Technical" },
  { value: "hr", label: "HR" },
  { value: "behavioral", label: "Behavioral" },
  { value: "mixed", label: "Mixed" },
] as const;

export default function CreateInterviewPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [resumes, setResumes] = useState<{ _id: string; fileName: string }[]>([]);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateInterviewInput>({
    resolver: zodResolver(createInterviewSchema),
    defaultValues: { experienceLevel: "mid", interviewType: "mixed" },
  });

  useEffect(() => {
    api.get("/resume").then(({ data }) => setResumes(data.resumes)).catch(() => {});
  }, []);

  const onSubmit = async (values: CreateInterviewInput) => {
    setSubmitting(true);
    try {
      const { data } = await api.post("/interview/create", values);
      toast.success("Interview created! Let's begin.");
      router.push(`/interview/${data.interview._id}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to create interview. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedType = watch("interviewType");
  const selectedLevel = watch("experienceLevel");

  return (
    <ProtectedRoute>
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Create a New Interview</h1>

        <Card>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="text-sm font-medium block mb-1.5">Job Role</label>
              <input
                placeholder="e.g. Frontend Developer, SOC Analyst, Data Scientist"
                className="glass-input"
                {...register("jobRole")}
              />
              {errors.jobRole && <p className="text-rose-500 text-xs mt-1">{errors.jobRole.message}</p>}
            </div>

            <div>
              <label className="text-sm font-medium block mb-2">Experience Level</label>
              <div className="grid grid-cols-5 gap-2">
                {experienceLevels.map((lvl) => (
                  <button
                    type="button"
                    key={lvl}
                    onClick={() => setValue("experienceLevel", lvl)}
                    className={cn(
                      "py-2 rounded-lg text-xs sm:text-sm capitalize transition border",
                      selectedLevel === lvl
                        ? "bg-primary-600 text-white border-primary-600"
                        : "glass-card border-transparent"
                    )}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium block mb-2">Interview Type</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {interviewTypes.map((t) => (
                  <button
                    type="button"
                    key={t.value}
                    onClick={() => setValue("interviewType", t.value)}
                    className={cn(
                      "py-2 rounded-lg text-sm transition border",
                      selectedType === t.value
                        ? "bg-primary-600 text-white border-primary-600"
                        : "glass-card border-transparent"
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {resumes.length > 0 && (
              <div>
                <label className="text-sm font-medium block mb-1.5">
                  Use Resume (optional — tailors questions to your background)
                </label>
                <select className="glass-input" {...register("resumeId")}>
                  <option value="">No resume — generic role-based questions</option>
                  {resumes.map((r) => (
                    <option key={r._id} value={r._id}>{r.fileName}</option>
                  ))}
                </select>
              </div>
            )}

            <button type="submit" disabled={submitting} className="btn-primary w-full">
              {submitting ? "Generating questions with AI..." : "Generate Interview"}
            </button>
          </form>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
