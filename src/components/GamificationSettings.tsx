"use client";

import { useState, useTransition } from "react";
import { Trophy, Users, Medal, Swords } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { updateGamificationSettings } from "@/app/actions/settings";

interface GamificationSettingsProps {
  enabled: boolean | null;
  achievements: boolean;
  whosFasting: boolean;
  leaderboard: boolean;
  challenge: boolean;
}

export const FEATURE_TOGGLES = [
  { key: "achievements" as const, label: "Achievements & Badges", Icon: Trophy },
  { key: "whosFasting" as const, label: "Who's Fasting Now", Icon: Users },
  { key: "leaderboard" as const, label: "Group Leaderboard", Icon: Medal },
  { key: "challenge" as const, label: "Weekly Challenge", Icon: Swords },
];

export default function GamificationSettings({
  enabled: initialEnabled,
  achievements: initialAchievements,
  whosFasting: initialWhosFasting,
  leaderboard: initialLeaderboard,
  challenge: initialChallenge,
}: GamificationSettingsProps) {
  const [enabled, setEnabled] = useState(initialEnabled === true);
  const [features, setFeatures] = useState({
    achievements: initialAchievements,
    whosFasting: initialWhosFasting,
    leaderboard: initialLeaderboard,
    challenge: initialChallenge,
  });
  const [isPending, startTransition] = useTransition();

  const handleMasterToggle = () => {
    const newEnabled = !enabled;
    setEnabled(newEnabled);
    startTransition(async () => {
      await updateGamificationSettings({ enabled: newEnabled });
    });
  };

  const handleFeatureToggle = (key: keyof typeof features) => {
    const newValue = !features[key];
    setFeatures((prev) => ({ ...prev, [key]: newValue }));
    startTransition(async () => {
      await updateGamificationSettings({ [key]: newValue });
    });
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Master Toggle */}
      <div className="flex items-center justify-between min-h-11">
        <label
          htmlFor="gamification-toggle"
          className="text-base text-[--color-text]"
        >
          Enable Gamification
        </label>
        <Switch
          id="gamification-toggle"
          checked={enabled}
          onCheckedChange={handleMasterToggle}
          disabled={isPending}
        />
      </div>

      {/* Individual Feature Toggles */}
      {enabled && (
        <div className="flex flex-col gap-4 motion-safe:animate-fade-in">
          <div className="border-t border-slate-200 dark:border-slate-700" />
          {FEATURE_TOGGLES.map(({ key, label, Icon }) => (
            <div key={key} className="flex items-center justify-between min-h-11">
              <div className="flex items-center gap-3">
                <Icon size={16} className="text-[--color-text-muted]" />
                <label
                  htmlFor={`gamification-${key}`}
                  className="text-base text-[--color-text]"
                >
                  {label}
                </label>
              </div>
              <Switch
                id={`gamification-${key}`}
                checked={features[key]}
                onCheckedChange={() => handleFeatureToggle(key)}
                disabled={isPending}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
