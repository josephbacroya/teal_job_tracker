// src/app/api/applications/route.ts
// Architecture note: We use a Route Handler here instead of a Server Action
// for the search/list endpoint because it supports GET requests with query params.
// Server Actions are best for mutations; Route Handlers for complex reads.

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { Prisma } from "@prisma/client";
import { ApplicationStatus } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") ?? "";
    const status = searchParams.get("status") as ApplicationStatus | null;
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const sortBy = (searchParams.get("sortBy") ?? "appliedAt") as
      | "appliedAt"
      | "companyName"
      | "status";
    const sortOrder = (searchParams.get("sortOrder") ?? "desc") as "asc" | "desc";
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const pageSize = Math.min(100, parseInt(searchParams.get("pageSize") ?? "20"));

    // Build where clause dynamically
    const where: Prisma.JobApplicationWhereInput = {
      userId: session.user.id,
      ...(search && {
        OR: [
          { companyName: { contains: search, mode: "insensitive" } },
          { jobTitle: { contains: search, mode: "insensitive" } },
        ],
      }),
      ...(status && { status }),
      ...(dateFrom || dateTo
        ? {
            appliedAt: {
              ...(dateFrom && { gte: new Date(dateFrom) }),
              ...(dateTo && { lte: new Date(dateTo) }),
            },
          }
        : {}),
    };

    // Run count and data fetch in parallel for efficiency
    const [total, data] = await Promise.all([
      prisma.jobApplication.count({ where }),
      prisma.jobApplication.findMany({
        where,
        include: {
          interviews: { orderBy: { scheduledAt: "asc" } },
          _count: { select: { appNotes: true } },
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return NextResponse.json({
      success: true,
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error("[GET /api/applications]", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
