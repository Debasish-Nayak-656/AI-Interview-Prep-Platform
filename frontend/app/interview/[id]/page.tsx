"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Mic, MicOff, Clock, Send, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Card } from "@/components/ui/Card";
import Skeleton from "@/components/ui/Skeleton";
import api from "@/lib/api";
import { Interview, Question } from "@/lib/utils";

const QUESTION_TIME_LIMIT = 120; // seconds per question

export default function InterviewSessionPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [interview, setInterview] = useState<Interview | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME_LIMIT);
  const [isRecording, setIsRecording] = useState(false);
  const [usedVoice, setUsedVoice] = useState(false);

  const recognitionRef = useRef<any>(null);
  const startTimeRef = useRef<number>(Date.now());

  // Load interview + questions
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get(`/interview/${id}`);
        setInterview(data.interview);
        setQuestions(data.questions);
        setCurrentIdx(data.interview.currentQuestionIndex || 0);
      } catch (err: any) {
        toast.error(err?.response?.data?.message || "Failed to load interview");
        router.push("/create-interview");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Per-question countdown timer
  useEffect(() => {
    if (loading) return;
    setTimeLeft(QUESTION_TIME_LIMIT);
    startTimeRef.current = Date.now();
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timer);
          handleSubmitAnswer(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIdx, loading]);

  // --- Voice input via the Web Speech API ---
  const toggleRecording = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Voice input isn't supported in this browser. Please use Chrome.");
      return;
    }

    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      let transcript = "";
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setAnswer(transcript);
      setUsedVoice(true);
    };
    recognition.onerror = () => setIsRecording(false);
    recognition.onend = () => setIsRecording(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  };

  const currentQuestion = questions[currentIdx];

  const handleSubmitAnswer = async (auto = false) => {
    if (!currentQuestion) return;
    setSubmitting(true);
    recognitionRef.current?.stop();
    setIsRecording(false);

    const timeTakenSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);

    try {
      await api.post("/interview/submit", {
        questionId: currentQuestion._id,
        answerText: answer,
        answeredViaVoice: usedVoice,
        timeTakenSeconds,
      });

      if (auto) toast("Time's up — answer auto-submitted", { icon: "⏱️" });

      const isLast = currentIdx >= questions.length - 1;
      if (isLast) {
        await finishInterview();
      } else {
        setCurrentIdx((i) => i + 1);
        setAnswer("");
        setUsedVoice(false);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to submit answer");
    } finally {
      setSubmitting(false);
    }
  };

  const finishInterview = async () => {
    try {
      await api.post(`/interview/${id}/complete`);
      toast.success("Interview complete! Generating your report...");
      router.push(`/results/${id}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to finalize interview");
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="max-w-2xl mx-auto space-y-4">
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-48 w-full" />
        </div>
      </ProtectedRoute>
    );
  }

  const progressPct = questions.length ? ((currentIdx) / questions.length) * 100 : 0;

  return (
    <ProtectedRoute>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Progress bar */}
        <div>
          <div className="flex justify-between text-sm mb-1.5 text-slate-500">
            <span>Question {currentIdx + 1} of {questions.length}</span>
            <span className="flex items-center gap-1">
              <Clock size={14} className={timeLeft <= 20 ? "text-rose-500" : ""} />
              <span className={timeLeft <= 20 ? "text-rose-500 font-semibold" : ""}>
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
              </span>
            </span>
          </div>
          <div className="h-2 rounded-full bg-white/40 dark:bg-white/10 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary-600 to-accent-500 transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        <Card className="space-y-5">
          <div>
            <span className="text-xs uppercase tracking-wide text-primary-600 font-semibold">
              {currentQuestion?.type}
            </span>
            <h2 className="text-lg font-semibold mt-1">{currentQuestion?.questionText}</h2>
          </div>

          <textarea
            rows={6}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type your answer here, or use the mic to speak it..."
            className="glass-input resize-none"
          />

          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={toggleRecording}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition ${
                isRecording
                  ? "bg-rose-500 text-white animate-pulseSlow"
                  : "glass-card"
              }`}
            >
              {isRecording ? <MicOff size={16} /> : <Mic size={16} />}
              {isRecording ? "Stop Recording" : "Answer by Voice"}
            </button>

            <button
              onClick={() => handleSubmitAnswer(false)}
              disabled={submitting}
              className="btn-primary flex items-center gap-2"
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              {currentIdx >= questions.length - 1 ? "Finish Interview" : "Next Question"}
            </button>
          </div>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
