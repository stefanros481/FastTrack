"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from "recharts";
import { Calendar } from "lucide-react";
import EmptyState from "@/components/EmptyState";

interface WeeklyDataPoint {
  weekStart: string;
  totalHours: number;
}

interface WeeklyChartProps {
  weekly: WeeklyDataPoint[];
}

function formatWeekTick(dateStr: string) {
  const [year, month, day] = dateStr.split("-");
  const d = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function WeeklyChart({ weekly }: WeeklyChartProps) {
  const isEmpty = weekly.every((d) => d.totalHours === 0);

  return (
    <div className="bg-[--color-card] dark:bg-slate-900 rounded-2xl p-4 motion-safe:animate-fade-in">
      <h3 className="text-sm font-semibold text-[--color-text-muted] uppercase tracking-wider mb-3">
        Weekly Totals
      </h3>

      {isEmpty ? (
        <EmptyState
          icon={Calendar}
          heading="No fasts yet"
          description="Start fasting to track your weekly progress"
        />
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={weekly}>
            <XAxis
              dataKey="weekStart"
              tickFormatter={formatWeekTick}
              tick={{ fontSize: 12, fill: "var(--color-text-muted)" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "var(--color-text-muted)" }}
              axisLine={false}
              tickLine={false}
              width={32}
            />
            <Bar
              dataKey="totalHours"
              fill="var(--color-primary)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
