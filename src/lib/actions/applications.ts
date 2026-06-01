// src/lib/actions/applications.ts
// Architecture note: Server Actions run on the server but are called from
// client components like regular async functions. This collocates data
// fetching logic with the UI that needs it, eliminating separate API routes
// for simple CRUD. We still use Route Handlers for complex queries (search).

"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import {
  createApplicationSchema,
  updateApplicationSchema,
} from "@/lib/validations/schemas";
import type { ApiResponse, JobApplicationWithRelations } from "@/types";

// ─── Helper: require auth ─────────────────────────────────────────────────────
async function requireAuth() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  return session.user.id;
}

// ─── Create ───────────────────────────────────────────────────────────────────
export async function createApplication(
  formData: unknown
): Promise<ApiResponse<JobApplicationWithRelations>> {
  try {
    const userId = await requireAuth();

    // Always validate on the server even if you validated on the client.
    // Client-side validation is UX; server-side is security.
    const parsed = createApplicationSchema.safeParse(formData);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.errors[0]?.message ?? "Validation failed",
      };
    }

    const data = parsed.data;

    const application = await prisma.jobApplication.create({
      data: {
        userId,
        companyName: data.companyName,
        jobTitle: data.jobTitle,
        location: data.location || null,
        salaryMin: data.salaryMin ?? null,
        salaryMax: data.salaryMax ?? null,
        jobUrl: data.jobUrl || null,
        appliedAt: data.appliedAt,
        status: data.status,
        notes: data.notes || null,
      },
      include: { interviews: true, appNotes: true },
    });

    revalidatePath("/dashboard");
    revalidatePath("/applications");

    return { success: true, data: application as JobApplicationWithRelations };
  } catch (error) {
    console.error("[createApplication]", error);
    return { success: false, error: "Failed to create application" };
  }
}

// ─── Update ───────────────────────────────────────────────────────────────────
export async function updateApplication(
  formData: unknown
): Promise<ApiResponse<JobApplicationWithRelations>> {
  try {
    const userId = await requireAuth();

    const parsed = updateApplicationSchema.safeParse(formData);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.errors[0]?.message ?? "Validation failed",
      };
    }

    const { id, ...data } = parsed.data;

    // Authorization check: ensure this application belongs to the current user.
    // Never trust the client to only send their own IDs.
    const existing = await prisma.jobApplication.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return { success: false, error: "Application not found" };
    }

    const application = await prisma.jobApplication.update({
      where: { id },
      data: {
        ...(data.companyName && { companyName: data.companyName }),
        ...(data.jobTitle && { jobTitle: data.jobTitle }),
        location: data.location ?? existing.location,
        salaryMin: data.salaryMin ?? existing.salaryMin,
        salaryMax: data.salaryMax ?? existing.salaryMax,
        jobUrl: data.jobUrl ?? existing.jobUrl,
        ...(data.appliedAt && { appliedAt: data.appliedAt }),
        ...(data.status && { status: data.status }),
        notes: data.notes ?? existing.notes,
      },
      include: { interviews: true, appNotes: true },
    });

    revalidatePath("/dashboard");
    revalidatePath("/applications");
    revalidatePath(`/applications/${id}`);

    return { success: true, data: application as JobApplicationWithRelations };
  } catch (error) {
    console.error("[updateApplication]", error);
    return { success: false, error: "Failed to update application" };
  }
}

// ─── Delete ───────────────────────────────────────────────────────────────────
export async function deleteApplication(id: string): Promise<ApiResponse> {
  try {
    const userId = await requireAuth();

    const existing = await prisma.jobApplication.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return { success: false, error: "Application not found" };
    }

    await prisma.jobApplication.delete({ where: { id } });

    revalidatePath("/dashboard");
    revalidatePath("/applications");

    return { success: true, message: "Application deleted" };
  } catch (error) {
    console.error("[deleteApplication]", error);
    return { success: false, error: "Failed to delete application" };
  }
}

// ─── Get One ──────────────────────────────────────────────────────────────────
export async function getApplication(
  id: string
): Promise<ApiResponse<JobApplicationWithRelations>> {
  try {
    const userId = await requireAuth();

    const application = await prisma.jobApplication.findFirst({
      where: { id, userId },
      include: {
        interviews: { orderBy: { scheduledAt: "asc" } },
        appNotes: { orderBy: { createdAt: "desc" } },
      },
    });

    if (!application) {
      return { success: false, error: "Application not found" };
    }

    return { success: true, data: application as JobApplicationWithRelations };
  } catch (error) {
    console.error("[getApplication]", error);
    return { success: false, error: "Failed to fetch application" };
  }
}

// ─── Get Dashboard Stats ──────────────────────────────────────────────────────
export async function getDashboardStats() {
  try {
    const userId = await requireAuth();

    // Use a single aggregation query instead of multiple round trips.
    // Architecture note: Prisma's groupBy runs a single SQL GROUP BY query.
    const statusCounts = await prisma.jobApplication.groupBy({
      by: ["status"],
      where: { userId },
      _count: true,
    });

    const statusMap = Object.fromEntries(
      statusCounts.map((s) => [s.status, s._count])
    );

    const total = statusCounts.reduce((sum, s) => sum + s._count, 0);
    const active = total - (statusMap["REJECTED"] ?? 0) - (statusMap["OFFER"] ?? 0);
    const interviews =
      (statusMap["RECRUITER_SCREEN"] ?? 0) +
      (statusMap["TECHNICAL_INTERVIEW"] ?? 0) +
      (statusMap["FINAL_INTERVIEW"] ?? 0);

    // Applications per month for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const recentApps = await prisma.jobApplication.findMany({
      where: { userId, appliedAt: { gte: sixMonthsAgo } },
      select: { appliedAt: true, status: true },
    });

    // Group by month in JS (avoids database-specific date functions)
    const byMonth: Record<string, number> = {};
    for (const app of recentApps) {
      const key = `${app.appliedAt.getFullYear()}-${String(
        app.appliedAt.getMonth() + 1
      ).padStart(2, "0")}`;
      byMonth[key] = (byMonth[key] ?? 0) + 1;
    }

    const applicationsByMonth = Object.entries(byMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, count]) => ({ month, count }));

    return {
      success: true,
      data: {
        stats: {
          total,
          active,
          interviews,
          offers: statusMap["OFFER"] ?? 0,
          rejections: statusMap["REJECTED"] ?? 0,
        },
        statusDistribution: statusCounts.map((s) => ({
          status: s.status,
          count: s._count,
          label: s.status.replace(/_/g, " "),
        })),
        applicationsByMonth,
        successRate:
          total > 0
            ? Math.round(((statusMap["OFFER"] ?? 0) / total) * 100)
            : 0,
      },
    };
  } catch (error) {
    console.error("[getDashboardStats]", error);
    return { success: false, error: "Failed to fetch dashboard stats" };
  }
}
