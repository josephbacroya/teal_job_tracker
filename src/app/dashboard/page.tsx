// src/app/dashboard/page.tsx
// Architecture note: This is a React Server Component (RSC). It fetches data
// on the server — zero waterfall, zero loading spinner for initial data.
// Only interactive pieces are Client Components.

import { getDashboardStats } from "@/lib/actions/applications";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { ApplicationsByMonthChart } from "@/components/dashboard/applications-by-month-chart";
// import { StatusDistributionChart } from "@/components/dashboard/status-distribution-chart"; // <-- Removed unused import
import { RecentApplications } from "@/components/dashboard/recent-applications";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth/auth";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user!.id as string;

  // Parallel data fetching — these don't depend on each other
  const [statsResult, recentApps] = await Promise.all([
    getDashboardStats(),
    prisma.jobApplication.findMany({
      where: { userId },
      include: { interviews: true },
      orderBy: { appliedAt: "desc" },
      take: 5,
    }),
  ]);

  const dashboardData = statsResult.success ? statsResult.data : null;

  return (
    <div className="space-y-6 max-w-7xl mx-auto bg-[#F8F9FA] min-h-full p-8 rounded-2xl">
      {/* Header */}
      <div>
        <h1 className="text-[24px] font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Your job search at a glance
        </p>
      </div>

      {/* Row 1: Stats */}
      <StatsCards stats={dashboardData?.stats ?? null} />

      {/* Row 2: Charts & Top Jobs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ApplicationsByMonthChart
            data={dashboardData?.applicationsByMonth ?? []}
          />
        </div>
        <div className="lg:col-span-1 bg-white border border-border rounded-[16px] p-6 shadow-sm">
          <h2 className="text-[16px] font-semibold text-foreground mb-4">Top Jobs</h2>
          <div className="space-y-4">
            {/* Mock Top Jobs */}
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  C
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold">Software Engineer</h3>
                  <p className="text-xs text-muted-foreground">Google • Applied 2d ago</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: Recent Applications & Today's Task */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentApplications applications={recentApps} />
        </div>
        <div className="lg:col-span-1 bg-white border border-border rounded-[16px] p-6 shadow-sm">
          {/* Fixed unescaped entity below */}
          <h2 className="text-[16px] font-semibold text-foreground mb-4">Today&apos;s Task</h2>
          <div className="space-y-4">
            {/* Mock Today's Tasks */}
            {[1, 2].map(i => (
              <div key={i} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="w-1.5 h-10 bg-primary rounded-full" />
                <div className="flex-1">
                  <h3 className="text-sm font-semibold">Technical Interview</h3>
                  <p className="text-xs text-muted-foreground">Stripe • 2:00 PM</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}