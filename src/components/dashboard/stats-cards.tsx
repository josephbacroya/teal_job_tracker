// src/components/dashboard/stats-cards.tsx
import { Briefcase, TrendingUp, Calendar, Trophy, XCircle } from "lucide-react";
import type { DashboardStats } from "@/types";

interface StatsCardsProps {
  stats: DashboardStats | null;
}

const CARDS = [
  {
    key: "total" as const,
    label: "Total Applications",
    icon: Briefcase,
    color: "text-blue-400",
    bgColor: "bg-blue-400/10",
  },
  {
    key: "active" as const,
    label: "Active Applications",
    icon: TrendingUp,
    color: "text-emerald-400",
    bgColor: "bg-emerald-400/10",
  },
  {
    key: "interviews" as const,
    label: "In Interviews",
    icon: Calendar,
    color: "text-amber-400",
    bgColor: "bg-amber-400/10",
  },
  {
    key: "offers" as const,
    label: "Offers Received",
    icon: Trophy,
    color: "text-purple-400",
    bgColor: "bg-purple-400/10",
  },
  {
    key: "rejections" as const,
    label: "Rejections",
    icon: XCircle,
    color: "text-red-400",
    bgColor: "bg-red-400/10",
  },
];

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
      {CARDS.map((card) => {
        const Icon = card.icon;
        const value = stats?.[card.key] ?? 0;

        return (
          <div
            key={card.key}
            className="bg-card border border-border rounded-[16px] p-6 shadow-sm flex flex-col justify-between hover:-translate-y-1 hover:shadow-md transition-all duration-300 group cursor-default"
          >
            <div className="space-y-4">
              <div className={`h-10 w-10 rounded-xl ${card.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                <Icon className={`h-5 w-5 ${card.color}`} />
              </div>
              <div>
                <div className="text-[28px] font-extrabold text-foreground leading-none">
                  {stats === null ? (
                    <div className="h-8 w-12 bg-muted rounded animate-pulse" />
                  ) : (
                    value
                  )}
                </div>
                <div className="text-[12px] text-muted-foreground mt-1.5">{card.label}</div>
              </div>
            </div>
            {/* Micro-chart Placeholder */}
            <div className="mt-4 h-[40px] w-full rounded bg-gradient-to-t from-primary/10 to-transparent flex items-end">
               <div className="h-[2px] w-full bg-primary/40 rounded-full"></div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
