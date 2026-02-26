"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ReferenceLine,
} from "recharts";
import { BarChart3 } from "lucide-react";
import EmptyState from "@/components/EmptyState";

interface DurationDataPoint {
  date: string;
  durationHours: number;
}

interface DurationChartProps {
  duration: DurationDataPoint[];
  defaultGoalHours: number | null;
  range: number;
  onRangeChange: (range: number) => void;
}

const RANGES = [
  { value: 7, label: "7 days" },
  { value: 30, label: "30 days" },
  { value: 90, label: "90 days" },
] as const;

function formatDateTick(dateStr: string) {
  return new Date(dateStr).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export default function DurationChart({
  duration,
  defaultGoalHours,
  range,
  onRangeChange,
}: DurationChartProps) {
  return (
    <div className="bg-[--color-card] dark:bg-slate-900 rounded-2xl p-4 motion-safe:animate-fade-in">
      <h3 className="text-sm font-semibold text-[--color-text-muted] uppercase tracking-wider mb-3">
        Duration
      </h3>

      {/* Range selector */}
      <div className="flex gap-2 mb-4">
        {RANGES.map((r) => (
          <button
            key={r.value}
            onClick={() => onRangeChange(r.value)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
              range === r.value
                ? "bg-[--color-primary] text-white"
                : "bg-[--color-primary-light] text-[--color-primary-dark]"
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      {duration.length > 0 ? (
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={duration}>
            <XAxis
              dataKey="date"
              tickFormatter={formatDateTick}
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
              dataKey="durationHours"
              fill="var(--color-primary)"
              radius={[4, 4, 0, 0]}
            />
            {defaultGoalHours != null && (
              <ReferenceLine
                y={defaultGoalHours}
                stroke="var(--color-warning)"
                strokeDasharray="6 4"
              />
            )}
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <EmptyState
          icon={BarChart3}
          heading="No fasts yet"
          description="Complete a fast to see your duration chart"
        />
      )}
    </div>
  );
}
