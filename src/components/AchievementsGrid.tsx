"use client";

import { BADGES, BADGE_CATEGORIES } from "@/lib/badges";
import type { ComputedBadgeState } from "@/types/badges";

interface AchievementsGridProps {
  badgeState: ComputedBadgeState;
}

const CATEGORY_COLORS: Record<string, string> = {
  streak: "text-amber-500",
  volume: "text-indigo-600 dark:text-indigo-400",
  duration: "text-emerald-600 dark:text-emerald-400",
  consistency: "text-indigo-600 dark:text-indigo-400",
  goals: "text-emerald-600 dark:text-emerald-400",
};

export default function AchievementsGrid({ badgeState }: AchievementsGridProps) {
  const earnedIds = new Set(badgeState.earned.map((e) => e.badgeId));
  const progressByCategory = new Map(
    badgeState.progress.map((p) => [p.category, p])
  );

  return (
    <div className="space-y-6">
      {BADGE_CATEGORIES.map(({ key, label }) => {
        const categoryBadges = BADGES.filter((b) => b.category === key);
        const progress = progressByCategory.get(key);

        return (
          <div key={key}>
            <h3 className="text-sm font-semibold text-[--color-text-muted] uppercase tracking-wider mb-3">
              {label}
            </h3>
            <div
              style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "0.75rem" }}
            >
              {categoryBadges.map((badge) => {
                const isEarned = earnedIds.has(badge.id);
                const isNextBadge = progress?.nextBadgeId === badge.id;
                const Icon = badge.icon;

                return (
                  <div
                    key={badge.id}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl min-h-[88px] ${
                      isEarned
                        ? "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                        : "bg-slate-100 dark:bg-slate-800/50"
                    }`}
                  >
                    <Icon
                      size={28}
                      className={
                        isEarned
                          ? CATEGORY_COLORS[badge.category]
                          : "text-slate-400 dark:text-slate-600"
                      }
                    />
                    <span
                      className={`text-[10px] font-semibold mt-1.5 text-center leading-tight ${
                        isEarned ? "" : "text-slate-400 dark:text-slate-500"
                      }`}
                    >
                      {badge.label}
                    </span>
                    {!isEarned && isNextBadge && progress && (
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                        {progress.current}/{progress.target}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
