// src/types/index.ts
// Architecture note: Centralizing types in one place means changes
// to the data model propagate via TypeScript's compiler, not runtime bugs.



// ─── Re-export Prisma enums so the rest of the app imports from one place ─────
import { ApplicationStatus, InterviewOutcome, InterviewType } from "@prisma/client";
export { ApplicationStatus, InterviewOutcome, InterviewType };

// ─── Application ──────────────────────────────────────────────────────────────
export interface JobApplicationWithRelations {
  id: string;
  userId: string;
  companyName: string;
  jobTitle: string;
  location: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  jobUrl: string | null;
  appliedAt: Date;
  status: ApplicationStatus;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  interviews: InterviewWithRelations[];
  appNotes: NoteType[];
}

export interface InterviewWithRelations {
  id: string;
  applicationId: string;
  type: InterviewType;
  scheduledAt: Date;
  location: string | null;
  notes: string | null;
  outcome: InterviewOutcome | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface NoteType {
  id: string;
  applicationId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Dashboard Stats ──────────────────────────────────────────────────────────
export interface DashboardStats {
  total: number;
  active: number;
  interviews: number;
  offers: number;
  rejections: number;
}

export interface ApplicationsByMonth {
  month: string;
  count: number;
}

export interface StatusDistribution {
  status: ApplicationStatus;
  count: number;
  label: string;
}

// ─── Form Values ──────────────────────────────────────────────────────────────
export interface CreateApplicationInput {
  companyName: string;
  jobTitle: string;
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  jobUrl?: string;
  appliedAt: Date;
  status: ApplicationStatus;
  notes?: string;
}

export interface UpdateApplicationInput extends Partial<CreateApplicationInput> {
  id: string;
}

export interface CreateInterviewInput {
  applicationId: string;
  type: InterviewType;
  scheduledAt: Date;
  location?: string;
  notes?: string;
  outcome?: InterviewOutcome;
}

// ─── Filter / Search ─────────────────────────────────────────────────────────
export interface ApplicationFilters {
  search?: string;
  status?: ApplicationStatus;
  dateFrom?: Date;
  dateTo?: Date;
  sortBy?: "appliedAt" | "companyName" | "status";
  sortOrder?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ─── API Response ─────────────────────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ─── Status Config ────────────────────────────────────────────────────────────
// Centralizing display config prevents scattered switch statements.
export const STATUS_CONFIG: Record<
  ApplicationStatus,
  { label: string; color: string; bgColor: string; dotColor: string }
> = {
  WISHLIST: {
    label: "Wishlist",
    color: "text-slate-400",
    bgColor: "bg-slate-400/10",
    dotColor: "bg-slate-400",
  },
  APPLIED: {
    label: "Applied",
    color: "text-blue-400",
    bgColor: "bg-blue-400/10",
    dotColor: "bg-blue-400",
  },
  RECRUITER_SCREEN: {
    label: "Recruiter Screen",
    color: "text-purple-400",
    bgColor: "bg-purple-400/10",
    dotColor: "bg-purple-400",
  },
  TECHNICAL_INTERVIEW: {
    label: "Technical Interview",
    color: "text-amber-400",
    bgColor: "bg-amber-400/10",
    dotColor: "bg-amber-400",
  },
  FINAL_INTERVIEW: {
    label: "Final Interview",
    color: "text-orange-400",
    bgColor: "bg-orange-400/10",
    dotColor: "bg-orange-400",
  },
  OFFER: {
    label: "Offer",
    color: "text-emerald-400",
    bgColor: "bg-emerald-400/10",
    dotColor: "bg-emerald-400",
  },
  REJECTED: {
    label: "Rejected",
    color: "text-red-400",
    bgColor: "bg-red-400/10",
    dotColor: "bg-red-400",
  },
};

export const INTERVIEW_TYPE_LABELS: Record<InterviewType, string> = {
  PHONE: "Phone Screen",
  VIDEO: "Video Call",
  ONSITE: "On-site",
  TECHNICAL: "Technical",
  BEHAVIORAL: "Behavioral",
  FINAL: "Final Round",
};

export const INTERVIEW_OUTCOME_LABELS: Record<InterviewOutcome, string> = {
  PASSED: "Passed",
  FAILED: "Failed",
  PENDING: "Pending",
  CANCELLED: "Cancelled",
};
