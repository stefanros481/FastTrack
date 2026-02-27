"use client";

import { useState, useMemo, useTransition } from "react";
import { format, subDays, startOfDay, isSameDay } from "date-fns";
import { Clock, X, Check, AlertCircle } from "lucide-react";
import { WheelPicker, WheelPickerStyles } from "@/components/ui/wheel-picker";
import { updateActiveStartTime } from "@/app/actions/fasting";

const DAYS_BACK = 7;

function buildDayItems(now: Date) {
  const items: { value: number; label: string }[] = [];
  for (let i = 0; i < DAYS_BACK; i++) {
    const d = subDays(startOfDay(now), i);
    const label = i === 0
      ? "Today"
      : i === 1
        ? "Yesterday"
        : format(d, "EEE, MMM d");
    items.push({ value: i, label });
  }
  return items;
}

const HOUR_ITEMS = Array.from({ length: 24 }, (_, i) => ({
  value: i,
  label: i.toString().padStart(2, "0"),
}));

const MINUTE_ITEMS = Array.from({ length: 60 }, (_, i) => ({
  value: i,
  label: i.toString().padStart(2, "0"),
}));

interface StartTimeAdjusterProps {
  sessionId: string;
  currentStartedAt: string; // ISO string
  onClose: () => void;
  onUpdated: (newStartedAt: string) => void;
}

export default function StartTimeAdjuster({
  sessionId,
  currentStartedAt,
  onClose,
  onUpdated,
}: StartTimeAdjusterProps) {
  const now = useMemo(() => new Date(), []);
  const currentDate = useMemo(() => new Date(currentStartedAt), [currentStartedAt]);

  // Compute initial day offset
  const initialDayOffset = useMemo(() => {
    for (let i = 0; i < DAYS_BACK; i++) {
      if (isSameDay(subDays(now, i), currentDate)) return i;
    }
    return 0; // fallback to today
  }, [now, currentDate]);

  const [dayOffset, setDayOffset] = useState(initialDayOffset);
  const [hour, setHour] = useState(currentDate.getHours());
  const [minute, setMinute] = useState(currentDate.getMinutes());
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const dayItems = useMemo(() => buildDayItems(now), [now]);

  // Build the selected date from wheel values
  const selectedDate = useMemo(() => {
    const d = subDays(startOfDay(now), dayOffset);
    d.setHours(hour, minute, 0, 0);
    return d;
  }, [now, dayOffset, hour, minute]);

  const isFuture = selectedDate.getTime() > Date.now();
  const isUnchanged = selectedDate.getTime() === currentDate.getTime();

  const handleConfirm = () => {
    if (isFuture || isUnchanged) return;
    setError(null);
    startTransition(async () => {
      const result = await updateActiveStartTime(sessionId, selectedDate);
      if (result.success) {
        onUpdated(selectedDate.toISOString());
        onClose();
      } else {
        setError(result.error);
      }
    });
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 motion-safe:animate-fade-in"
        onClick={onClose}
      />

      {/* Bottom sheet */}
      <div className="fixed inset-x-0 bottom-0 z-50 bg-white dark:bg-slate-900 rounded-t-3xl shadow-2xl motion-safe:animate-slide-up pb-safe">
        <WheelPickerStyles />

        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pb-3">
          <button
            onClick={onClose}
            className="p-2 -ml-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 min-h-11 min-w-11 flex items-center justify-center"
          >
            <X size={22} />
          </button>
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-indigo-500" />
            <h3 className="text-lg font-bold">Adjust Start Time</h3>
          </div>
          <button
            onClick={handleConfirm}
            disabled={isPending || isFuture || isUnchanged}
            className="p-2 -mr-2 rounded-full text-indigo-600 hover:text-indigo-700 disabled:text-slate-300 dark:disabled:text-slate-700 min-h-11 min-w-11 flex items-center justify-center"
          >
            <Check size={22} strokeWidth={2.5} />
          </button>
        </div>

        {/* Wheel pickers */}
        <div className="flex items-start justify-center gap-1 px-4 pb-2">
          <WheelPicker
            items={dayItems}
            selectedValue={dayOffset}
            onChange={(v) => setDayOffset(v as number)}
            label="Day"
            className="flex-1 min-w-0"
          />
          <div className="flex items-center justify-center self-center mt-8 text-2xl font-bold text-slate-400">
            :
          </div>
          <WheelPicker
            items={HOUR_ITEMS}
            selectedValue={hour}
            onChange={(v) => setHour(v as number)}
            label="Hour"
            className="w-20"
          />
          <div className="flex items-center justify-center self-center mt-8 text-2xl font-bold text-slate-400">
            :
          </div>
          <WheelPicker
            items={MINUTE_ITEMS}
            selectedValue={minute}
            onChange={(v) => setMinute(v as number)}
            label="Min"
            className="w-20"
          />
        </div>

        {/* Preview + errors */}
        <div className="px-5 pb-6 space-y-2">
          <div className="text-center text-sm text-slate-500">
            {format(selectedDate, "EEEE, MMM d · HH:mm")}
          </div>

          {isFuture && (
            <div className="flex items-center justify-center gap-1.5 text-sm text-red-500">
              <AlertCircle size={14} />
              Start time cannot be in the future
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center gap-1.5 text-sm text-red-500 animate-shake">
              <AlertCircle size={14} />
              {error}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
