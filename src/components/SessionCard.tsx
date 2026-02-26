import { ChevronRight } from "lucide-react";

const FASTING_PROTOCOLS = [
  { hours: 16, name: "16:8" },
  { hours: 18, name: "18:6" },
  { hours: 20, name: "20:4" },
  { hours: 24, name: "24h" },
];

interface CompletedSession {
  id: string;
  startedAt: string;
  endedAt: string;
  goalMinutes: number | null;
  notes: string | null;
}

interface Props {
  session: CompletedSession;
  onSelect: (session: CompletedSession) => void;
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

export default function SessionCard({ session, onSelect }: Props) {
  const durationHours =
    (new Date(session.endedAt).getTime() -
      new Date(session.startedAt).getTime()) /
    (1000 * 60 * 60);

  const goalMet =
    session.goalMinutes != null && durationHours >= session.goalMinutes / 60;

  const protocolMatch = FASTING_PROTOCOLS.find(
    (p) => p.hours * 60 === session.goalMinutes
  );
  const protocolName = protocolMatch?.name ?? "Custom";

  return (
    <button
      onClick={() => onSelect(session)}
      className="w-full text-left bg-[--color-card] dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between active:scale-[0.98] transition-transform min-h-11"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold">
            {durationHours.toFixed(1)}h
          </span>
          {goalMet && (
            <span className="bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">
              Goal Hit
            </span>
          )}
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            {protocolName}
          </span>
        </div>
        <div className="text-[11px] text-slate-500 mt-1 flex flex-wrap gap-x-2" suppressHydrationWarning>
          <span suppressHydrationWarning>
            {formatDateLabel(session.startedAt)}{" "}
            {formatTimeLabel(session.startedAt)}
          </span>
          <span>&rarr;</span>
          <span suppressHydrationWarning>
            {formatDateLabel(session.endedAt)}{" "}
            {formatTimeLabel(session.endedAt)}
          </span>
        </div>
        {session.notes && (
          <p className="text-sm text-[--color-text-muted] truncate mt-1">
            {session.notes}
          </p>
        )}
      </div>
      <div className="text-slate-300 dark:text-slate-600 ml-2 flex-shrink-0">
        <ChevronRight size={20} />
      </div>
    </button>
  );
}
