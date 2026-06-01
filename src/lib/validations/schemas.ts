// src/lib/validations/schemas.ts
import { z } from "zod";
import { ApplicationStatus, InterviewOutcome, InterviewType } from "@/types";

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

// ─── Job Application ──────────────────────────────────────────────────────────
// Architecture note: We extract the base object separately so we can call
// .partial() on it for the update schema. Zod's .refine() returns a ZodEffects
// type which does NOT support .partial() or .extend() — only ZodObject does.
const applicationBaseSchema = z.object({
  companyName: z
    .string()
    .min(1, "Company name is required")
    .max(100, "Company name is too long"),
  jobTitle: z
    .string()
    .min(1, "Job title is required")
    .max(100, "Job title is too long"),
  location: z.string().max(100).optional().or(z.literal("")),
  salaryMin: z.number().int().positive().max(10_000_000).optional().nullable(),
  salaryMax: z.number().int().positive().max(10_000_000).optional().nullable(),
  jobUrl: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  appliedAt: z.date(),
  status: z.nativeEnum(ApplicationStatus),
  notes: z.string().max(5000).optional().or(z.literal("")),
});

export const createApplicationSchema = applicationBaseSchema.refine(
  (data) => {
    if (data.salaryMin && data.salaryMax) {
      return data.salaryMin <= data.salaryMax;
    }
    return true;
  },
  { message: "Min salary must be less than max salary", path: ["salaryMax"] }
);

export const updateApplicationSchema = applicationBaseSchema.partial().extend({
  id: z.string().cuid(),
});

// ─── Interview ────────────────────────────────────────────────────────────────
const interviewBaseSchema = z.object({
  applicationId: z.string().cuid(),
  type: z.nativeEnum(InterviewType),
  scheduledAt: z.date(),
  location: z.string().max(500).optional().or(z.literal("")),
  notes: z.string().max(5000).optional().or(z.literal("")),
  outcome: z.nativeEnum(InterviewOutcome).optional().nullable(),
});

export const createInterviewSchema = interviewBaseSchema;

export const updateInterviewSchema = interviewBaseSchema.partial().extend({
  id: z.string().cuid(),
});

// ─── Note ─────────────────────────────────────────────────────────────────────
export const createNoteSchema = z.object({
  applicationId: z.string().cuid(),
  content: z.string().min(1, "Note cannot be empty").max(5000),
});

// ─── Filters ──────────────────────────────────────────────────────────────────
export const applicationFiltersSchema = z.object({
  search: z.string().optional(),
  status: z.nativeEnum(ApplicationStatus).optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
  sortBy: z.enum(["appliedAt", "companyName", "status"]).optional().default("appliedAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
  page: z.number().int().positive().optional().default(1),
  pageSize: z.number().int().positive().max(100).optional().default(20),
});

// ─── Inferred types ───────────────────────────────────────────────────────────
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateApplicationInput = z.infer<typeof createApplicationSchema>;
export type UpdateApplicationInput = z.infer<typeof updateApplicationSchema>;
export type CreateInterviewInput = z.infer<typeof createInterviewSchema>;
export type UpdateInterviewInput = z.infer<typeof updateInterviewSchema>;
export type CreateNoteInput = z.infer<typeof createNoteSchema>;
export type ApplicationFiltersInput = z.infer<typeof applicationFiltersSchema>;
