"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { History } from "lucide-react";
import MonthGroup from "@/components/MonthGroup";
import SessionCardSkeleton from "@/components/SessionCardSkeleton";
import type { CompletedSession } from "@/types/session";

interface ApiResponse {
  data: CompletedSession[];
  nextCursor: string | null;
  hasMore: boolean;
}

function groupByMonth(
  sessions: CompletedSession[]
): [string, CompletedSession[]][] {
  const groups = new Map<string, CompletedSession[]>();
  for (const session of sessions) {
    const monthKey = session.startedAt.slice(0, 7); // "YYYY-MM"
    const group = groups.get(monthKey);
    if (group) {
      group.push(session);
    } else {
      groups.set(monthKey, [session]);
    }
  }
  return Array.from(groups.entries());
}

export default function HistoryList() {
  const router = useRouter();
  const [sessions, setSessions] = useState<CompletedSession[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSession, setSelectedSession] =
    useState<CompletedSession | null>(null);
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(
    new Set()
  );
  const initialExpandDone = useRef(false);

  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);

  const monthGroups = useMemo(
    () => groupByMonth(sessions),
    [sessions]
  );

  // Auto-expand the most recent month on initial load
  useEffect(() => {
    if (!initialExpandDone.current && monthGroups.length > 0) {
      initialExpandDone.current = true;
      setExpandedMonths(new Set([monthGroups[0][0]]));
    }
  }, [monthGroups]);

  const handleToggleMonth = useCallback((monthKey: string) => {
    setExpandedMonths((prev) => {
      const next = new Set(prev);
      if (next.has(monthKey)) {
        next.delete(monthKey);
      } else {
        next.add(monthKey);
      }
      return next;
    });
  }, []);

  const fetchSessions = useCallback(
    async (pageCursor: string | null, append: boolean) => {
      if (loadingRef.current) return;
      loadingRef.current = true;
      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({ pageSize: "20" });
        if (pageCursor) params.set("cursor", pageCursor);

        const res = await fetch(`/api/sessions?${params}`);
        if (!res.ok) throw new Error("Failed to fetch sessions");

        const json: ApiResponse = await res.json();

        setSessions((prev) => (append ? [...prev, ...json.data] : json.data));
        setCursor(json.nextCursor);
        setHasMore(json.hasMore);
      } catch {
        setError("Failed to load sessions. Tap to retry.");
      } finally {
        setIsLoading(false);
        setIsInitialLoad(false);
        loadingRef.current = false;
      }
    },
    []
  );

  // Initial fetch
  useEffect(() => {
    fetchSessions(null, false);
  }, [fetchSessions]);

  // Infinite scroll observer
  useEffect(() => {
    if (!sentinelRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingRef.current) {
          fetchSessions(cursor, true);
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, cursor, fetchSessions]);

  const handleSelectSession = useCallback((session: CompletedSession) => {
    setSelectedSession(session);
  }, []);

  const handleModalClose = useCallback(
    (opts?: { deleted?: boolean }) => {
      if (opts?.deleted && selectedSession) {
        setSessions((prev) =>
          prev.filter((s) => s.id !== selectedSession.id)
        );
        // Refresh server components (stats in Insights tab)
        router.refresh();
      } else {
        // Refetch to reflect any edits
        setSessions([]);
        setIsInitialLoad(true);
        setCursor(null);
        setHasMore(true);
        initialExpandDone.current = false;
        setExpandedMonths(new Set());
        fetchSessions(null, false);
      }
      setSelectedSession(null);
    },
    [selectedSession, fetchSessions, router]
  );

  // Lazy import SessionDetailModal to avoid circular dependency issues
  const [SessionDetailModal, setSessionDetailModal] = useState<
    React.ComponentType<{
      session: CompletedSession;
      onClose: (opts?: { deleted?: boolean }) => void;
    }> | null
  >(null);

  useEffect(() => {
    import("@/components/SessionDetailModal").then((mod) => {
      setSessionDetailModal(() => mod.default);
    });
  }, []);

  // Initial loading state
  if (isInitialLoad) {
    return (
      <div className="space-y-3">
        <SessionCardSkeleton count={3} />
      </div>
    );
  }

  // Empty state
  if (sessions.length === 0 && !isLoading) {
    return (
      <div className="text-center py-20 text-slate-500 bg-white dark:bg-slate-900 rounded-[3rem] border border-dashed border-slate-300 dark:border-slate-800">
        <History size={48} className="mx-auto mb-4 opacity-10" />
        <p>No fasting sessions yet</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {monthGroups.map(([monthKey, groupSessions]) => (
          <MonthGroup
            key={monthKey}
            monthKey={monthKey}
            sessions={groupSessions}
            isExpanded={expandedMonths.has(monthKey)}
            onToggle={handleToggleMonth}
            onSelectSession={handleSelectSession}
          />
        ))}

        {/* Loading more indicator */}
        {isLoading && !isInitialLoad && <SessionCardSkeleton count={2} />}

        {/* Error with retry */}
        {error && (
          <button
            onClick={() => fetchSessions(cursor, true)}
            className="w-full text-center py-4 text-sm text-[--color-error]"
          >
            {error}
          </button>
        )}

        {/* Sentinel for infinite scroll */}
        {hasMore && <div ref={sentinelRef} className="h-1" />}
      </div>

      {/* Session Detail Modal */}
      {selectedSession && SessionDetailModal && (
        <SessionDetailModal
          session={selectedSession}
          onClose={handleModalClose}
        />
      )}
    </>
  );
}
