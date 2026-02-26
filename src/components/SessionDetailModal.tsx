"use client";

import { useState, useEffect, useTransition } from "react";
import { X } from "lucide-react";
import { updateSession } from "@/app/actions/fasting";
import { sessionEditSchema } from "@/lib/validators";
import { DateTimePicker } from "@/components/ui/date-time-picker";

interface SessionData {
  id: string;
  startedAt: string;
  endedAt: string;
  goalMinutes: number | null;
}

interface Props {
  session: SessionData;
  onClose: () => void;
}

function formatDuration(startedAt: Date, endedAt: Date): string {
  const diffMs = endedAt.getTime() - startedAt.getTime();
  if (diffMs <= 0) return "—";
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
}

export default function SessionDetailModal({ session, onClose }: Props) {
  const [startDate, setStartDate] = useState(new Date(session.startedAt));
  const [endDate, setEndDate] = useState(new Date(session.endedAt));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");
  const [isPending, startTransition] = useTransition();

  const duration = formatDuration(startDate, endDate);

  const goalHours = session.goalMinutes ? session.goalMinutes / 60 : null;
  const actualHours =
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);
  const goalMet = goalHours ? actualHours >= goalHours : false;

  // Client-side validation on field change
  useEffect(() => {
    const result = sessionEditSchema.safeParse({
      sessionId: session.id,
      startedAt: startDate,
      endedAt: endDate,
    });

    if (result.success) {
      setErrors({});
    } else {
      const newErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as string;
        if (!newErrors[field]) {
          newErrors[field] = issue.message;
        }
      }
      setErrors(newErrors);
    }
  }, [startDate, endDate, session.id]);

  const hasErrors = Object.keys(errors).length > 0;

  const handleSave = () => {
    if (hasErrors) return;
    setServerError("");

    startTransition(async () => {
      try {
        const result = await updateSession(session.id, startDate, endDate);
        if (result.success) {
          onClose();
        } else {
          if (result.field) {
            setErrors((prev) => ({
              ...prev,
              [result.field!]: result.error,
            }));
          } else {
            setServerError(result.error);
          }
        }
      } catch {
        setServerError("Something went wrong. Please try again.");
      }
    });
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 motion-safe:animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-t-3xl p-6 pb-10 motion-safe:animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Session Details</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 min-h-11 min-w-11 flex items-center justify-center"
          >
            <X size={20} />
          </button>
        </div>

        {/* Duration display */}
        <div className="text-center mb-6">
          <div className="text-3xl font-bold">{duration}</div>
          <div className="text-sm text-[--color-text-muted] mt-1">
            {goalHours
              ? goalMet
                ? "Goal reached"
                : `Goal: ${goalHours}h`
              : "No goal set"}
          </div>
        </div>

        {/* Start time field */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-[--color-text-muted] mb-1">
            Start Time
          </label>
          <DateTimePicker
            value={startDate}
            onChange={setStartDate}
            error={!!errors.startedAt}
          />
          {errors.startedAt && (
            <p className="text-sm text-red-600 mt-1">{errors.startedAt}</p>
          )}
        </div>

        {/* End time field */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-[--color-text-muted] mb-1">
            End Time
          </label>
          <DateTimePicker
            value={endDate}
            onChange={setEndDate}
            error={!!errors.endedAt}
          />
          {errors.endedAt && (
            <p className="text-sm text-red-600 mt-1">{errors.endedAt}</p>
          )}
        </div>

        {/* Server error */}
        {serverError && (
          <p className="text-sm text-red-600 mb-4 text-center">
            {serverError}
          </p>
        )}

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={hasErrors || isPending}
          className={`w-full py-4 rounded-full font-bold text-lg min-h-11 transition-all ${
            hasErrors || isPending
              ? "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
              : "bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95"
          }`}
        >
          {isPending ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}
