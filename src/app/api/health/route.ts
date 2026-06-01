// src/app/api/health/route.ts
// Simple health check endpoint used by Vercel, uptime monitors, and load balancers
// to verify the app is running and the DB connection is alive.

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  try {
    // Ping the database
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: "ok", db: "connected" }, { status: 200 });
  } catch {
    return NextResponse.json({ status: "error", db: "disconnected" }, { status: 503 });
  }
}
