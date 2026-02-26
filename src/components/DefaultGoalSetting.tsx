"use client";

import { useState, useTransition } from "react";
import { updateDefaultGoal } from "@/app/actions/settings";

const GOAL_OPTIONS = [
  { minutes: null, label: "None" },
  { minutes: 720, label: "12h" },
  { minutes: 960, label: "16h" },
  { minutes: 1080, label: "18h" },
  { minutes: 1200, label: "20h" },
  { minutes: 1440, label: "24h" },
];

interface DefaultGoalSettingProps {
  currentDefault: number | null;
}

export default function DefaultGoalSetting({
  currentDefault,
}: DefaultGoalSettingProps) {
  const [selected, setSelected] = useState<number | null>(currentDefault);
  const [isCustom, setIsCustom] = useState(
    currentDefault !== null &&
      !GOAL_OPTIONS.some((o) => o.minutes === currentDefault)
  );
  const [customHours, setCustomHours] = useState(
    isCustom && currentDefault ? String(currentDefault / 60) : ""
  );
  const [isPending, startTransition] = useTransition();

  const handleSelect = (minutes: number | null) => {
    setIsCustom(false);
    setCustomHours("");
    setSelected(minutes);
    startTransition(async () => {
      await updateDefaultGoal(minutes);
    });
  };

  const handleCustomClick = () => {
    setIsCustom(true);
  };

  const handleCustomChange = (input: string) => {
    setCustomHours(input);
    const parsed = parseFloat(input);
    if (!isNaN(parsed) && parsed >= 1 && parsed <= 72) {
      const minutes = Math.round(parsed * 60);
      setSelected(minutes);
      startTransition(async () => {
        await updateDefaultGoal(minutes);
      });
    }
  };

  return (
    <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
      <h3 className="text-base font-medium text-[--color-text] mb-3">
        Default fasting goal
      </h3>
      <div className="flex flex-wrap gap-2">
        {GOAL_OPTIONS.map((option) => {
          const isSelected =
            !isCustom && selected === option.minutes;
          return (
            <button
              key={option.label}
              onClick={() => handleSelect(option.minutes)}
              disabled={isPending}
              className={`min-h-11 min-w-11 px-4 py-2 rounded-full font-semibold text-sm transition-all ${
                isSelected
                  ? "bg-[--color-primary] text-white"
                  : "bg-[--color-primary-light] text-[--color-primary-dark]"
              } ${isPending ? "opacity-60" : ""}`}
            >
              {option.label}
            </button>
          );
        })}
        <button
          onClick={handleCustomClick}
          disabled={isPending}
          className={`min-h-11 min-w-11 px-4 py-2 rounded-full font-semibold text-sm transition-all ${
            isCustom
              ? "bg-[--color-primary] text-white"
              : "bg-[--color-primary-light] text-[--color-primary-dark]"
          } ${isPending ? "opacity-60" : ""}`}
        >
          Custom
        </button>
      </div>

      {isCustom && (
        <div className="mt-3 motion-safe:animate-fade-in">
          <input
            type="number"
            inputMode="decimal"
            min={1}
            max={72}
            step="0.5"
            placeholder="Hours (1–72)"
            value={customHours}
            onChange={(e) => handleCustomChange(e.target.value)}
            className="w-full rounded-xl bg-[--color-background] text-base min-h-11 px-4 py-2 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[--color-primary]"
          />
        </div>
      )}
    </div>
  );
}
