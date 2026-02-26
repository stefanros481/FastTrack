"use client";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Target } from "lucide-react";
import EmptyState from "@/components/EmptyState";

interface GoalRateData {
  hit: number;
  total: number;
  percentage: number;
}

interface GoalRateChartProps {
  goalRate: GoalRateData;
}

export default function GoalRateChart({ goalRate }: GoalRateChartProps) {
  if (goalRate.total === 0) {
    return (
      <div className="bg-[--color-card] dark:bg-slate-900 rounded-2xl p-4 motion-safe:animate-fade-in">
        <h3 className="text-sm font-semibold text-[--color-text-muted] uppercase tracking-wider mb-3">
          Goal Rate
        </h3>
        <EmptyState
          icon={Target}
          heading="No goals tracked"
          description="Set a fasting goal to track your hit rate"
        />
      </div>
    );
  }

  return (
    <div className="bg-[--color-card] dark:bg-slate-900 rounded-2xl p-4 motion-safe:animate-fade-in">
      <h3 className="text-sm font-semibold text-[--color-text-muted] uppercase tracking-wider mb-3">
        Goal Rate
      </h3>
      <div className="relative">
        <ResponsiveContainer width="100%" height={180}>
          <PieChart>
            <Pie
              data={[
                { name: "Hit", value: goalRate.hit },
                { name: "Missed", value: goalRate.total - goalRate.hit },
              ]}
              innerRadius={60}
              outerRadius={80}
              dataKey="value"
              startAngle={90}
              endAngle={-270}
              stroke="none"
            >
              <Cell fill="var(--color-success)" />
              <Cell fill="var(--color-primary-light)" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-3xl font-bold text-[--color-text]">
            {goalRate.percentage}%
          </span>
          <span className="text-sm text-[--color-text-muted]">
            goal hit rate
          </span>
        </div>
      </div>
    </div>
  );
}
