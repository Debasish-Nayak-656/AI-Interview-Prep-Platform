"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { registerSchema, RegisterInput } from "@/lib/validation";

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (data: RegisterInput) => {
    setSubmitting(true);
    try {
      await registerUser(data.name, data.email, data.password);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[70vh]">
      <div className="glass-card w-full max-w-md p-8 space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Start practicing interviews for free</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <input placeholder="Full name" className="glass-input" {...register("name")} />
            {errors.name && <p className="text-rose-500 text-xs mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <input type="email" placeholder="Email address" className="glass-input" {...register("email")} />
            {errors.email && <p className="text-rose-500 text-xs mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <input type="password" placeholder="Password" className="glass-input" {...register("password")} />
            {errors.password && <p className="text-rose-500 text-xs mt-1">{errors.password.message}</p>}
          </div>
          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 dark:text-slate-400">
          Already have an account?{" "}
          <Link href="/login" className="text-primary-600 font-medium">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
