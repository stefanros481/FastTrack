"use client";

import { useState, useCallback } from "react";
import { BADGES } from "@/lib/badges";

interface BadgeCelebrationProps {
  newBadgeIds: string[];
  onAllSeen: () => void;
}

const CELEBRATIONS_KEY = "fasttrack:celebrations-seen";

const CATEGORY_COLORS: Record<string, string> = {
  streak: "text-amber-500",
  volume: "text-indigo-600 dark:text-indigo-400",
  duration: "text-emerald-600 dark:text-emerald-400",
  consistency: "text-indigo-600 dark:text-indigo-400",
  goals: "text-emerald-600 dark:text-emerald-400",
};

export default function BadgeCelebration({ newBadgeIds, onAllSeen }: BadgeCelebrationProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentBadgeId = newBadgeIds[currentIndex];
  const badge = BADGES.find((b) => b.id === currentBadgeId);
  const isLast = currentIndex === newBadgeIds.length - 1;

  const markSeen = useCallback((badgeId: string) => {
    try {
      const seen = JSON.parse(localStorage.getItem(CELEBRATIONS_KEY) || "{}");
      seen[badgeId] = Date.now();
      localStorage.setItem(CELEBRATIONS_KEY, JSON.stringify(seen));
    } catch {
      // localStorage unavailable — non-critical
    }
  }, []);

  const handleDismiss = useCallback(() => {
    markSeen(currentBadgeId);

    if (isLast) {
      onAllSeen();
    } else {
      setCurrentIndex((i) => i + 1);
    }
  }, [currentBadgeId, isLast, markSeen, onAllSeen]);

  if (!badge) return null;

  const Icon = badge.icon;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50">
      <div className="mx-6 w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-8 text-center motion-safe:animate-bounce-in">
        <div className="flex justify-center mb-4">
          <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-800">
            <Icon
              size={48}
              className={CATEGORY_COLORS[badge.category] || "text-indigo-600"}
            />
          </div>
        </div>
        <h3 className="text-xl font-bold mb-1">{badge.label}</h3>
        <p className="text-sm text-[--color-text-muted] mb-6">
          {badge.description}
        </p>

        {newBadgeIds.length > 1 && (
          <p className="text-xs text-[--color-text-muted] mb-4">
            {currentIndex + 1} of {newBadgeIds.length}
          </p>
        )}

        <button
          onClick={handleDismiss}
          className="w-full min-h-11 rounded-full bg-[--color-primary] text-white font-semibold transition-all active:scale-95"
        >
          {isLast ? "Done" : "Next"}
        </button>
      </div>
    </div>
  );
}
