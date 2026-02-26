"use client";

import {
  BarChart3,
  Clock,
  Award,
  Flame,
  Trophy,
  Calendar,
  CalendarDays,
} from "lucide-react";
import type { FastingStats } from "@/app/actions/fasting";
import { formatDuration } from "@/lib/format";

interface StatsCardsProps {
  stats: FastingStats | null;
}

export default function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      label: "Total Fasts",
      value: stats ? `${stats.totalFasts}` : "0",
      icon: BarChart3,
      valueColor: "text-[--color-text]",
    },
    {
      label: "Avg. Duration",
      value: stats ? formatDuration(stats.avgHours * 3600000) : "0h 0m",
      icon: Clock,
      valueColor: "text-[--color-text]",
    },
    {
      label: "Longest Fast",
      value: stats ? formatDuration(stats.longestFast * 3600000) : "0h 0m",
      icon: Award,
      valueColor: "text-[--color-text]",
    },
    {
      label: "Current Streak",
      value: stats ? `${stats.currentStreak} days` : "0 days",
      icon: Flame,
      valueColor: "text-[--color-primary]",
    },
    {
      label: "Best Streak",
      value: stats ? `${stats.bestStreak} days` : "0 days",
      icon: Trophy,
      valueColor: "text-[--color-success]",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 motion-safe:animate-fade-in">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-[--color-card] dark:bg-slate-900 rounded-2xl p-4"
        >
          <card.icon className="text-[--color-text-muted] mb-2" size={20} />
          <div className={`text-3xl font-bold ${card.valueColor}`}>
            {card.value}
          </div>
          <div className="text-sm text-[--color-text-muted]">{card.label}</div>
        </div>
      ))}

      {/* Period summary cards — full width */}
      <div className="col-span-2 bg-[--color-card] dark:bg-slate-900 rounded-2xl p-4 flex items-center gap-4">
        <Calendar className="text-[--color-text-muted] shrink-0" size={20} />
        <div>
          <div className="text-3xl font-bold text-[--color-text]">
            {stats ? `${stats.thisWeek.count} fasts` : "0 fasts"}
          </div>
          <div className="text-sm text-[--color-text-muted]">
            This Week{stats ? ` \u00b7 ${stats.thisWeek.totalHours}h` : ""}
          </div>
        </div>
      </div>

      <div className="col-span-2 bg-[--color-card] dark:bg-slate-900 rounded-2xl p-4 flex items-center gap-4">
        <CalendarDays className="text-[--color-text-muted] shrink-0" size={20} />
        <div>
          <div className="text-3xl font-bold text-[--color-text]">
            {stats ? `${stats.thisMonth.count} fasts` : "0 fasts"}
          </div>
          <div className="text-sm text-[--color-text-muted]">
            This Month{stats ? ` \u00b7 ${stats.thisMonth.totalHours}h` : ""}
          </div>
        </div>
      </div>
    </div>
  );
}
