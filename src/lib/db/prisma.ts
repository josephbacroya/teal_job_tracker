// src/lib/db/prisma.ts
// Architecture note: In Next.js dev mode, Hot Module Replacement (HMR)
// re-runs modules on every change. Without this singleton pattern, you'd
// exhaust PostgreSQL's connection pool (default: 100 connections) quickly.
// The global object persists across HMR cycles.

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
