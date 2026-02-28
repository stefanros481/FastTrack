"use client";

import { useState, useEffect, useTransition, useCallback } from "react";
import {
  Timer,
  Flame,
  History,
  Play,
  CheckCircle2,
  Info,
  Zap,
  Droplets,
  Brain,
  Moon,
  BarChart3,
  Sun,
  Monitor,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { startFast, stopFast, updateActiveStartTime } from "@/app/actions/fasting";
import type { FastingStats } from "@/app/actions/fasting";
import { updateTheme } from "@/app/actions/settings";
import { activeStartTimeSchema } from "@/lib/validators";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ThemeProvider";
import HistoryList from "@/components/HistoryList";
import StatsCards from "@/components/StatsCards";
import GoalSelector from "@/components/GoalSelector";
import ProgressRing from "@/components/ProgressRing";
import DurationChart from "@/components/DurationChart";
import WeeklyChart from "@/components/WeeklyChart";
import GoalRateChart from "@/components/GoalRateChart";
import ChartSkeleton from "@/components/ChartSkeleton";
import Toast from "@/components/Toast";
import { useChartData } from "@/hooks/useChartData";
import { useGoalNotification } from "@/hooks/useGoalNotification";
import { useLongPress } from "@/hooks/useLongPress";

function useHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}

// --- Constants ---
const MILESTONES = [
  { hours: 8, label: "Blood Sugar Drops", Icon: Droplets },
  { hours: 12, label: "Ketosis Starts", Icon: Flame },
  { hours: 14, label: "Fat Burning", Icon: Zap },
  { hours: 16, label: "Autophagy Begins", Icon: Brain },
  { hours: 24, label: "Insulin Normalizes", Icon: CheckCircle2 },
];

interface ActiveSession {
  id: string;
  startedAt: string;
  goalMinutes: number | null;
  notes: string | null;
}

interface Props {
  activeFast: ActiveSession | null;
  stats: FastingStats | null;
  defaultGoalMinutes?: number | null;
}

// --- Helpers ---
function formatTime(totalSeconds: number) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function formatDateLabel(dateStr: string) {
  return new Date(dateStr).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    weekday: "short",
  });
}

function formatTimeLabel(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function formatRemaining(remainingSeconds: number) {
  const h = Math.floor(remainingSeconds / 3600);
  const m = Math.floor((remainingSeconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m to go`;
  return `${m}m to go`;
}

const THEME_CYCLE = ["light", "system", "dark"] as const;

function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const cycleTheme = () => {
    const idx = THEME_CYCLE.indexOf(theme);
    const next = THEME_CYCLE[(idx + 1) % THEME_CYCLE.length];
    setTheme(next);
    updateTheme(next);
  };

  return (
    <button
      onClick={cycleTheme}
      className="p-2 rounded-full transition-colors bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
      title={`Theme: ${theme}`}
    >
      {theme === "light" && <Sun className="w-5 h-5" />}
      {theme === "system" && <Monitor className="w-5 h-5" />}
      {theme === "dark" && <Moon className="w-5 h-5" />}
    </button>
  );
}

function DashboardView({ stats }: { stats: FastingStats | null }) {
  const { data, isLoading, range, setRange } = useChartData();

  return (
    <div className="space-y-6 motion-safe:animate-fade-in">
      <StatsCards stats={stats} />
      {isLoading || !data ? (
        <ChartSkeleton />
      ) : (
        <>
          <DurationChart
            duration={data.duration}
            defaultGoalHours={data.defaultGoalHours}
            range={range}
            onRangeChange={setRange}
          />
          <WeeklyChart weekly={data.weekly} />
          <GoalRateChart goalRate={data.goalRate} />
        </>
      )}
    </div>
  );
}

export default function FastingTimer({ activeFast, stats, defaultGoalMinutes }: Props) {
  const [view, setView] = useState<"timer" | "dashboard" | "history">("timer");
  const [goalMinutes, setGoalMinutes] = useState<number | null>(
    activeFast?.goalMinutes ?? null
  );
  const [currentFast, setCurrentFast] = useState(activeFast);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isPending, startTransition] = useTransition();
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [editStartTime, setEditStartTime] = useState<Date>(
    currentFast ? new Date(currentFast.startedAt) : new Date()
  );
  const [endError, setEndError] = useState<string | null>(null);
  const hydrated = useHydrated();

  const isFasting = !!currentFast;
  const startTimeMs = currentFast ? new Date(currentFast.startedAt).getTime() : null;

  const { showToast, toastMessage, dismissToast } = useGoalNotification({
    goalMinutes: currentFast?.goalMinutes ?? null,
    elapsedMs: elapsedSeconds * 1000,
    isActive: isFasting,
  });

  const handleLongPressComplete = useCallback(() => {
    if (!currentFast) return;
    startTransition(async () => {
      try {
        await stopFast(currentFast.id);
        setCurrentFast(null);
      } catch {
        setEndError("Failed to end session. Please try again.");
        longPressState.reset();
      }
    });
  }, [currentFast]);

  const longPressState = useLongPress({
    duration: 5000,
    onComplete: handleLongPressComplete,
  });

  const handleEndSessionAccessible = useCallback(() => {
    if (!currentFast) return;
    startTransition(async () => {
      try {
        await stopFast(currentFast.id);
        setCurrentFast(null);
      } catch {
        setEndError("Failed to end session. Please try again.");
      }
    });
  }, [currentFast]);

  // Timer tick
  useEffect(() => {
    if (!isFasting || !startTimeMs) {
      setElapsedSeconds(0);
      return;
    }

    const calculate = () => {
      const diff = Math.floor((Date.now() - startTimeMs) / 1000);
      setElapsedSeconds(diff > 0 ? diff : 0);
    };

    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [isFasting, startTimeMs]);

  const targetSeconds = goalMinutes ? goalMinutes * 60 : 16 * 3600;

  const handleStartFast = () => {
    startTransition(async () => {
      const session = await startFast(goalMinutes ?? undefined);
      setCurrentFast({
        id: session.id,
        startedAt: session.startedAt.toISOString(),
        goalMinutes: session.goalMinutes,
        notes: null,
      });
    });
  };

  const handleUpdateStartTime = (newDate: Date) => {
    if (!currentFast) return;
    const parsed = activeStartTimeSchema.safeParse({
      sessionId: currentFast.id,
      startedAt: newDate,
    });
    if (!parsed.success) return;
    setShowStartTimePicker(false);
    startTransition(async () => {
      const result = await updateActiveStartTime(currentFast.id, newDate);
      if (result.success) {
        setCurrentFast({ ...currentFast, startedAt: newDate.toISOString() });
      }
    });
  };

  // Dismiss error toast
  const dismissError = useCallback(() => setEndError(null), []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans pb-28">
      {/* Header */}
      <header className="p-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-full transition-colors ${isFasting ? "bg-indigo-100 dark:bg-indigo-900/30" : "bg-slate-200 dark:bg-slate-800"}`}
          >
            <Flame
              className={`w-6 h-6 ${isFasting ? "text-indigo-600" : "text-slate-400"}`}
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">FastTrack</h1>
            <p className="text-slate-500 text-sm">
              {view === "timer"
                ? isFasting
                  ? goalMinutes
                    ? `Goal: ${goalMinutes / 60}h`
                    : "Fasting"
                  : "Ready to start?"
                : view === "dashboard"
                  ? "Insights"
                  : "Log"}
            </p>
          </div>
        </div>
        <ThemeToggle />
      </header>

      <main className="px-6 max-w-md mx-auto">
        {/* --- TIMER VIEW --- */}
        {view === "timer" && (
          <div className="space-y-6 motion-safe:animate-fade-in">
            {/* Goal selector (idle only) */}
            {!isFasting && (
              <GoalSelector
                value={goalMinutes}
                onChange={setGoalMinutes}
                defaultGoalMinutes={defaultGoalMinutes ?? null}
              />
            )}

            {/* Timer display — always ProgressRing for active sessions */}
            {isFasting ? (
              <div className="flex flex-col items-center py-6">
                <ProgressRing
                  progress={Math.min(elapsedSeconds / targetSeconds, 1)}
                  goalReached={
                    currentFast?.goalMinutes
                      ? elapsedSeconds >= currentFast.goalMinutes * 60
                      : false
                  }
                  elapsedFormatted={formatTime(elapsedSeconds)}
                  percentText={`${Math.min(Math.round((elapsedSeconds / targetSeconds) * 100), 100)}%`}
                  remainingText={
                    currentFast?.goalMinutes &&
                    elapsedSeconds >= currentFast.goalMinutes * 60
                      ? "Goal reached!"
                      : formatRemaining(targetSeconds - elapsedSeconds)
                  }
                  longPressProgress={longPressState.progress}
                  isPressed={longPressState.isPressed}
                  longPressHandlers={longPressState.handlers}
                  onEndSession={handleEndSessionAccessible}
                />
                {startTimeMs && hydrated && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditStartTime(new Date(currentFast!.startedAt));
                      setShowStartTimePicker(true);
                    }}
                    className="flex items-center gap-2 text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full mt-4 min-h-11 transition-all active:scale-95"
                  >
                    <Moon size={12} />
                    Started {formatDateLabel(currentFast!.startedAt)} @{" "}
                    {formatTimeLabel(currentFast!.startedAt)}
                  </button>
                )}
              </div>
            ) : (
              /* Start Fast button (idle state) */
              <button
                onClick={handleStartFast}
                disabled={isPending}
                className={`w-full py-6 rounded-3xl font-bold text-xl shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 min-h-11 bg-indigo-600 text-white hover:bg-indigo-700 ${isPending ? "opacity-60" : ""}`}
              >
                <Play fill="currentColor" size={24} /> Start{" "}
                {goalMinutes ? `${goalMinutes / 60}h` : ""} Fast
              </button>
            )}

            {/* Milestones (active only) */}
            {isFasting && (
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 motion-safe:animate-fade-in">
                <h3 className="font-bold flex items-center gap-2 text-sm text-slate-500 uppercase tracking-wider">
                  <Info size={16} />
                  Metabolic Stages
                </h3>
                <div className="space-y-4">
                  {MILESTONES.map((m) => {
                    const isReached = elapsedSeconds >= m.hours * 3600;
                    return (
                      <div
                        key={m.hours}
                        className={`flex items-center gap-4 transition-opacity ${isReached ? "opacity-100" : "opacity-40"}`}
                      >
                        <div
                          className={`p-2.5 rounded-2xl ${
                            isReached
                              ? "bg-green-100 dark:bg-green-900/30 text-green-600"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                          }`}
                        >
                          {isReached ? (
                            <CheckCircle2 size={18} />
                          ) : (
                            <m.Icon size={18} />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-bold">{m.label}</div>
                          <div className="text-xs text-slate-500">
                            {m.hours}h mark
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- DASHBOARD VIEW --- */}
        {view === "dashboard" && (
          <DashboardView stats={stats} />
        )}

        {/* --- HISTORY VIEW --- */}
        {view === "history" && (
          <div className="motion-safe:animate-fade-in">
            <HistoryList />
          </div>
        )}
      </main>

      {/* Toast notification */}
      {showToast && <Toast message={toastMessage} onDismiss={dismissToast} />}
      {endError && <Toast message={endError} onDismiss={dismissError} />}

      {/* Active session start time picker */}
      {showStartTimePicker && currentFast && (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50"
        >
          <div
            className="w-full max-w-md bg-white dark:bg-slate-900 rounded-t-3xl p-6 pb-10 motion-safe:animate-slide-up"
          >
            <h2 className="text-lg font-bold mb-4">Adjust Start Time</h2>
            <DateTimePicker
              value={editStartTime}
              onChange={setEditStartTime}
            />
            <div className="flex gap-3 mt-4">
              <Button
                variant="outline"
                className="flex-1 min-h-11"
                onClick={() => setShowStartTimePicker(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 min-h-11"
                onClick={() => handleUpdateStartTime(editStartTime)}
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 flex justify-around p-4 pb-8 z-50">
        <button
          onClick={() => setView("timer")}
          className={`flex flex-col items-center gap-1 transition-all ${view === "timer" ? "text-indigo-600 scale-110" : "text-slate-400"}`}
        >
          <Timer size={24} />
          <span className="text-[10px] font-bold uppercase tracking-tighter">
            Timer
          </span>
        </button>
        <button
          onClick={() => setView("dashboard")}
          className={`flex flex-col items-center gap-1 transition-all ${view === "dashboard" ? "text-indigo-600 scale-110" : "text-slate-400"}`}
        >
          <BarChart3 size={24} />
          <span className="text-[10px] font-bold uppercase tracking-tighter">
            Insights
          </span>
        </button>
        <button
          onClick={() => setView("history")}
          className={`flex flex-col items-center gap-1 transition-all ${view === "history" ? "text-indigo-600 scale-110" : "text-slate-400"}`}
        >
          <History size={24} />
          <span className="text-[10px] font-bold uppercase tracking-tighter">
            Log
          </span>
        </button>
        <Link
          href="/settings"
          className="flex flex-col items-center gap-1 transition-all text-slate-400"
        >
          <Settings size={24} />
          <span className="text-[10px] font-bold uppercase tracking-tighter">
            Settings
          </span>
        </Link>
      </nav>
    </div>
  );
}
