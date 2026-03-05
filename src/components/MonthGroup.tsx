"use client";

import { ChevronRight } from "lucide-react";
import SessionCard from "@/components/SessionCard";
import type { CompletedSession } from "@/types/session";

interface MonthGroupProps {
  monthKey: string;
  sessions: CompletedSession[];
  isExpanded: boolean;
  onToggle: (monthKey: string) => void;
  onSelectSession: (session: CompletedSession) => void;
}

function formatMonthLabel(monthKey: string): string {
  const [year, month] = monthKey.split("-").map(Number);
  return new Date(year, month - 1).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
}

export default function MonthGroup({
  monthKey,
  sessions,
  isExpanded,
  onToggle,
  onSelectSession,
}: MonthGroupProps) {
  const sessionCount = sessions.length;
  const label = formatMonthLabel(monthKey);

  return (
    <div>
      <button
        type="button"
        onClick={() => onToggle(monthKey)}
        className="flex w-full items-center justify-between py-3 px-1 min-h-11"
      >
        <span className="text-sm font-semibold text-[--color-text-muted] uppercase tracking-wider">
          {label}
          {!isExpanded && (
            <span className="ml-2 normal-case tracking-normal font-normal">
              ({sessionCount} {sessionCount === 1 ? "session" : "sessions"})
            </span>
          )}
        </span>
        <ChevronRight
          size={16}
          className={`text-slate-400 dark:text-slate-600 motion-safe:transition-transform motion-safe:duration-200 ${
            isExpanded ? "rotate-90" : "rotate-0"
          }`}
        />
      </button>

      {isExpanded && (
        <div className="space-y-3">
          {sessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              onSelect={onSelectSession}
            />
          ))}
        </div>
      )}
    </div>
  );
}
