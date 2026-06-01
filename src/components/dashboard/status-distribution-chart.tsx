// src/components/dashboard/status-distribution-chart.tsx
"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import type { StatusDistribution } from "@/types";
import { STATUS_CONFIG } from "@/types";

interface Props {
  data: StatusDistribution[];
}

const RADIAN = Math.PI / 180;

function CustomLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }: {
  cx: number; cy: number; midAngle: number;
  innerRadius: number; outerRadius: number; percent: number;
}) {
  if (percent < 0.05) return null;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

export function StatusDistributionChart({ data }: Props) {
  const chartData = data.map((d) => ({
    ...d,
    name: STATUS_CONFIG[d.status]?.label ?? d.status,
    fill: getColor(d.status),
  }));

  return (
    <div className="bg-card border border-border rounded-xl p-5 h-full">
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-foreground">Status Distribution</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Current pipeline breakdown</p>
      </div>

      {chartData.length === 0 ? (
        <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
          No applications yet
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie data={chartData} cx="50%" cy="50%" outerRadius={80} dataKey="count"
              labelLine={false} label={CustomLabel}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(222.2 84% 4.9%)",
                border: "1px solid hsl(217.2 32.6% 17.5%)",
                borderRadius: "8px",
                color: "hsl(210 40% 98%)",
                fontSize: "12px",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

function getColor(status: string): string {
  const colorMap: Record<string, string> = {
    WISHLIST: "#94a3b8",
    APPLIED: "#60a5fa",
    RECRUITER_SCREEN: "#a78bfa",
    TECHNICAL_INTERVIEW: "#fbbf24",
    FINAL_INTERVIEW: "#fb923c",
    OFFER: "#34d399",
    REJECTED: "#f87171",
  };
  return colorMap[status] ?? "#94a3b8";
}
