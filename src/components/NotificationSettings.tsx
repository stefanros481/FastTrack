"use client";

import { useState, useTransition } from "react";
import {
  updateReminderSettings,
  updateMaxDuration,
} from "@/app/actions/settings";
import {
  reminderTimeSchema,
  maxDurationMinutesSchema,
} from "@/lib/validators";

interface NotificationSettingsProps {
  reminderEnabled: boolean;
  reminderTime: string | null;
  maxDurationMinutes: number | null;
}

export default function NotificationSettings({
  reminderEnabled,
  reminderTime,
  maxDurationMinutes,
}: NotificationSettingsProps) {
  const [enabled, setEnabled] = useState(reminderEnabled);
  const [time, setTime] = useState(reminderTime ?? "08:00");
  const [maxHours, setMaxHours] = useState(
    maxDurationMinutes ? String(maxDurationMinutes / 60) : ""
  );
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    const newEnabled = !enabled;
    setEnabled(newEnabled);
    startTransition(async () => {
      await updateReminderSettings(newEnabled, time);
    });
  };

  const handleTimeChange = (newTime: string) => {
    setTime(newTime);
    if (!reminderTimeSchema.safeParse(newTime).success) return;
    startTransition(async () => {
      await updateReminderSettings(enabled, newTime);
    });
  };

  const handleMaxDurationChange = (value: string) => {
    setMaxHours(value);
    if (value === "") {
      startTransition(async () => {
        await updateMaxDuration(null);
      });
      return;
    }
    const parsed = parseFloat(value);
    if (isNaN(parsed)) return;
    const minutes = Math.round(parsed * 60);
    if (!maxDurationMinutesSchema.safeParse(minutes).success) return;
    startTransition(async () => {
      await updateMaxDuration(minutes);
    });
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Daily Reminder Toggle */}
      <div className="flex items-center justify-between">
        <label
          htmlFor="reminder-toggle"
          className="text-base text-[--color-text]"
        >
          Daily Reminder
        </label>
        <button
          id="reminder-toggle"
          role="switch"
          aria-checked={enabled}
          onClick={handleToggle}
          disabled={isPending}
          className={`relative w-12 h-7 rounded-full transition-colors p-2 box-content ${
            enabled ? "bg-[--color-primary]" : "bg-slate-300 dark:bg-slate-600"
          } ${isPending ? "opacity-60" : ""}`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform ${
              enabled ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      {/* Reminder Time */}
      {enabled && (
        <div className="flex items-center justify-between motion-safe:animate-fade-in">
          <label
            htmlFor="reminder-time"
            className="text-base text-[--color-text]"
          >
            Reminder Time
          </label>
          <input
            id="reminder-time"
            type="time"
            value={time}
            onChange={(e) => handleTimeChange(e.target.value)}
            disabled={isPending}
            className="min-h-11 px-3 rounded-xl bg-[--color-background] text-base border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[--color-primary]"
          />
        </div>
      )}

      {/* Max Duration Alert */}
      <div className="flex items-center justify-between">
        <div>
          <label
            htmlFor="max-duration"
            className="text-base text-[--color-text]"
          >
            Max Duration Alert
          </label>
          <p className="text-sm text-[--color-text-muted]">Hours (1–72)</p>
        </div>
        <input
          id="max-duration"
          type="number"
          inputMode="decimal"
          min={1}
          max={72}
          step="1"
          placeholder="Off"
          value={maxHours}
          onChange={(e) => handleMaxDurationChange(e.target.value)}
          disabled={isPending}
          className="w-20 min-h-11 px-3 rounded-xl bg-[--color-background] text-base text-center border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[--color-primary]"
        />
      </div>
    </div>
  );
}
