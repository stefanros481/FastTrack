"use client";

import { useState, useEffect, useTransition } from "react";
import { getBadges } from "@/app/actions/badges";
import { BADGES } from "@/lib/badges";
import type { ComputedBadgeState } from "@/types/badges";
import AchievementsGrid from "@/components/AchievementsGrid";
import BadgeCelebration from "@/components/BadgeCelebration";

function LoadingSkeleton() {
  return (
    <div className="space-y-4 motion-safe:animate-pulse">
      <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded-xl" />
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-24 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

const CELEBRATIONS_KEY = "fasttrack:celebrations-seen";

function getSeenCelebrations(): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem(CELEBRATIONS_KEY) || "{}");
  } catch {
    return {};
  }
}

export default function CommunityView() {
  const [badgeState, setBadgeState] = useState<ComputedBadgeState | null>(null);
  const [loading, setLoading] = useState(true);
  const [, startTransition] = useTransition();
  const [newBadgeIds, setNewBadgeIds] = useState<string[]>([]);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    startTransition(async () => {
      const data = await getBadges();
      setBadgeState(data);
      setLoading(false);

      if (data) {
        const seen = getSeenCelebrations();
        const unseen = data.earned
          .map((e) => e.badgeId)
          .filter((id) => !(id in seen));
        if (unseen.length > 0) {
          setNewBadgeIds(unseen);
          setShowCelebration(true);
        }
      }
    });
  }, []);

  const handleAllCelebrationsSeen = () => {
    setShowCelebration(false);
    setNewBadgeIds([]);
  };

  if (loading) {
    return (
      <div className="motion-safe:animate-fade-in">
        <LoadingSkeleton />
      </div>
    );
  }

  const earnedCount = badgeState?.earned.length ?? 0;

  return (
    <div className="space-y-4 motion-safe:animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Achievements</h2>
        <span className="text-sm text-[--color-text-muted]">
          {earnedCount}/{BADGES.length}
        </span>
      </div>

      {badgeState ? (
        <AchievementsGrid badgeState={badgeState} />
      ) : (
        <div className="text-center py-12">
          <p className="text-[--color-text-muted]">
            Complete your first fast to start earning badges!
          </p>
        </div>
      )}

      {showCelebration && newBadgeIds.length > 0 && (
        <BadgeCelebration
          newBadgeIds={newBadgeIds}
          onAllSeen={handleAllCelebrationsSeen}
        />
      )}
    </div>
  );
}
