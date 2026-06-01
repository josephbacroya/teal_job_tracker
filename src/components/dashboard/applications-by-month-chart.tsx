// src/components/dashboard/applications-by-month-chart.tsx
"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import type { ApplicationsByMonth } from "@/types";
import { format, parseISO } from "date-fns";

interface Props {
  data: ApplicationsByMonth[];
}

export function ApplicationsByMonthChart({ data }: Props) {
  const formatted = data.map((d) => ({
    ...d,
    month: format(parseISO(`${d.month}-01`), "MMM"),
  }));

  return (
    <div className="bg-card border border-border rounded-[16px] p-6 h-full shadow-sm">
      <div className="mb-6">
        <h2 className="text-[16px] font-semibold text-foreground">Applications Over Time</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Last 6 months</p>
      </div>

      {formatted.length === 0 ? (
        <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
          No data yet. Start adding applications!
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={formatted} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FF6B35" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#FF6B35" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E9ECEF" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fill: "#6C757D", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              tickMargin={10}
            />
            <YAxis
              tick={{ fill: "#6C757D", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
              tickMargin={10}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#FFFFFF",
                border: "1px solid #E9ECEF",
                borderRadius: "8px",
                color: "#212529",
                fontSize: "12px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
              }}
              cursor={{ stroke: "#FF6B35", strokeWidth: 1, strokeDasharray: "4 4", fill: "transparent" }}
            />
            <Area 
              type="monotone" 
              dataKey="count" 
              stroke="#FF6B35" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorCount)" 
              name="Applications" 
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
