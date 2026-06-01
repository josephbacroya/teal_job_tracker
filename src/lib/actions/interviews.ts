// src/lib/actions/interviews.ts
"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import {
  createInterviewSchema,
  updateInterviewSchema,
} from "@/lib/validations/schemas";
import type { ApiResponse, InterviewWithRelations } from "@/types";

async function requireAuth() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user.id;
}

export async function createInterview(
  formData: unknown
): Promise<ApiResponse<InterviewWithRelations>> {
  try {
    const userId = await requireAuth();

    const parsed = createInterviewSchema.safeParse(formData);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0]?.message ?? "Validation failed" };
    }

    // Verify the application belongs to this user before adding an interview
    const application = await prisma.jobApplication.findFirst({
      where: { id: parsed.data.applicationId, userId },
    });
    if (!application) {
      return { success: false, error: "Application not found" };
    }

    const interview = await prisma.interview.create({
      data: {
        applicationId: parsed.data.applicationId,
        type: parsed.data.type,
        scheduledAt: parsed.data.scheduledAt,
        location: parsed.data.location || null,
        notes: parsed.data.notes || null,
        outcome: parsed.data.outcome ?? null,
      },
    });

    revalidatePath(`/applications/${parsed.data.applicationId}`);
    revalidatePath("/dashboard");

    return { success: true, data: interview as InterviewWithRelations };
  } catch (error) {
    console.error("[createInterview]", error);
    return { success: false, error: "Failed to create interview" };
  }
}

export async function updateInterview(
  formData: unknown
): Promise<ApiResponse<InterviewWithRelations>> {
  try {
    const userId = await requireAuth();

    const parsed = updateInterviewSchema.safeParse(formData);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0]?.message ?? "Validation failed" };
    }

    const { id, ...data } = parsed.data;

    // Join to verify ownership without a second round trip
    const interview = await prisma.interview.findFirst({
      where: { id, application: { userId } },
    });
    if (!interview) {
      return { success: false, error: "Interview not found" };
    }

    const updated = await prisma.interview.update({
      where: { id },
      data: {
        ...(data.type && { type: data.type }),
        ...(data.scheduledAt && { scheduledAt: data.scheduledAt }),
        location: data.location ?? interview.location,
        notes: data.notes ?? interview.notes,
        outcome: data.outcome !== undefined ? data.outcome : interview.outcome,
      },
    });

    revalidatePath(`/applications/${interview.applicationId}`);

    return { success: true, data: updated as InterviewWithRelations };
  } catch (error) {
    console.error("[updateInterview]", error);
    return { success: false, error: "Failed to update interview" };
  }
}

export async function deleteInterview(id: string): Promise<ApiResponse> {
  try {
    const userId = await requireAuth();

    const interview = await prisma.interview.findFirst({
      where: { id, application: { userId } },
    });
    if (!interview) {
      return { success: false, error: "Interview not found" };
    }

    await prisma.interview.delete({ where: { id } });
    revalidatePath(`/applications/${interview.applicationId}`);

    return { success: true, message: "Interview deleted" };
  } catch (error) {
    console.error("[deleteInterview]", error);
    return { success: false, error: "Failed to delete interview" };
  }
}
