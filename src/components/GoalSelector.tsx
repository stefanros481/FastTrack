"use client";

import { useState, useEffect } from "react";

const GOAL_OPTIONS = [
  { hours: 12, label: "12h", subtitle: null },
  { hours: 16, label: "16h", subtitle: "Intermittent" },
  { hours: 18, label: "18h", subtitle: "Advanced" },
  { hours: 20, label: "20h", subtitle: "Warrior" },
  { hours: 24, label: "24h", subtitle: "OMAD" },
];

interface GoalSelectorProps {
  value: number | null;
  onChange: (minutes: number | null) => void;
  defaultGoalMinutes: number | null;
}

export default function GoalSelector({
  value,
  onChange,
  defaultGoalMinutes,
}: GoalSelectorProps) {
  const [isCustom, setIsCustom] = useState(false);
  const [customHours, setCustomHours] = useState("");
  const [hasInitialized, setHasInitialized] = useState(false);

  // Pre-fill from default goal on mount
  useEffect(() => {
    if (hasInitialized) return;
    setHasInitialized(true);

    if (defaultGoalMinutes) {
      const matchingOption = GOAL_OPTIONS.find(
        (o) => o.hours * 60 === defaultGoalMinutes
      );
      if (matchingOption) {
        onChange(defaultGoalMinutes);
      } else {
        setIsCustom(true);
        setCustomHours(String(defaultGoalMinutes / 60));
        onChange(defaultGoalMinutes);
      }
    } else {
      // Default to first option (12h)
      onChange(GOAL_OPTIONS[0].hours * 60);
    }
  }, [defaultGoalMinutes, hasInitialized, onChange]);

  const selectedHours = value ? value / 60 : null;

  const handlePillClick = (hours: number) => {
    setIsCustom(false);
    setCustomHours("");
    onChange(hours * 60);
  };

  const handleCustomClick = () => {
    setIsCustom(true);
    if (customHours) {
      const parsed = parseFloat(customHours);
      if (!isNaN(parsed) && parsed >= 1 && parsed <= 72) {
        onChange(Math.round(parsed * 60));
      }
    } else {
      onChange(null);
    }
  };

  const handleCustomChange = (input: string) => {
    setCustomHours(input);
    const parsed = parseFloat(input);
    if (!isNaN(parsed) && parsed >= 1 && parsed <= 72) {
      onChange(Math.round(parsed * 60));
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-[--color-text] mb-3">
        Fasting Goal
      </h2>
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
        {GOAL_OPTIONS.map((option) => {
          const isSelected = !isCustom && selectedHours === option.hours;
          return (
            <button
              key={option.hours}
              onClick={() => handlePillClick(option.hours)}
              className={`flex-shrink-0 min-h-11 min-w-11 px-4 py-2 rounded-full font-semibold text-sm transition-all ${
                isSelected
                  ? "bg-[--color-primary] text-[--color-primary-foreground]"
                  : "bg-[--color-secondary] text-[--color-text]"
              }`}
            >
              <div>{option.label}</div>
              {option.subtitle && (
                <div
                  className={`text-[10px] font-normal ${isSelected ? "text-[--color-primary-foreground]/80" : "text-[--color-text-muted]"}`}
                >
                  {option.subtitle}
                </div>
              )}
            </button>
          );
        })}
        <button
          onClick={handleCustomClick}
          className={`flex-shrink-0 min-h-11 min-w-11 px-4 py-2 rounded-full font-semibold text-sm transition-all ${
            isCustom
              ? "bg-[--color-primary] text-[--color-primary-foreground]"
              : "bg-[--color-secondary] text-[--color-text]"
          }`}
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
          {customHours &&
            (parseFloat(customHours) < 1 || parseFloat(customHours) > 72 || isNaN(parseFloat(customHours))) && (
              <p className="text-[--color-error] text-sm mt-1">
                Enter a value between 1 and 72 hours
              </p>
            )}
        </div>
      )}
    </div>
  );
}
