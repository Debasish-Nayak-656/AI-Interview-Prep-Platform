"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { loginSchema, LoginInput } from "@/lib/validation";

export default function LoginPage() {
  const { login } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginInput) => {
    setSubmitting(true);
    try {
      await login(data.email, data.password);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[70vh]">
      <div className="glass-card w-full max-w-md p-8 space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Login to continue practicing</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <input type="email" placeholder="Email address" className="glass-input" {...register("email")} />
            {errors.email && <p className="text-rose-500 text-xs mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <input type="password" placeholder="Password" className="glass-input" {...register("password")} />
            {errors.password && <p className="text-rose-500 text-xs mt-1">{errors.password.message}</p>}
          </div>
          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 dark:text-slate-400">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-primary-600 font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
