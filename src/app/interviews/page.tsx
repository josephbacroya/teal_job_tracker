// src/app/interviews/page.tsx
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { InterviewsList } from "@/components/interviews/interviews-list";
import { redirect } from "next/navigation";

export default async function InterviewsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  const now = new Date();

  const [upcoming, past] = await Promise.all([
    prisma.interview.findMany({
      where: {
        scheduledAt: { gte: now },
        application: { userId: session.user.id },
      },
      include: { application: true },
      orderBy: { scheduledAt: "asc" },
    }),
    prisma.interview.findMany({
      where: {
        scheduledAt: { lt: now },
        application: { userId: session.user.id },
      },
      include: { application: true },
      orderBy: { scheduledAt: "desc" },
      take: 20,
    }),
  ]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Interviews</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Track your scheduled and past interviews
        </p>
      </div>
      <InterviewsList upcoming={upcoming} past={past} />
    </div>
  );
}
