import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const createInterviewSchema = z.object({
  jobRole: z.string().min(2, "Job role is required"),
  experienceLevel: z.enum(["fresher", "junior", "mid", "senior", "lead"]),
  interviewType: z.enum(["technical", "hr", "behavioral", "mixed"]),
  resumeId: z.string().optional(),
});
export type CreateInterviewInput = z.infer<typeof createInterviewSchema>;
