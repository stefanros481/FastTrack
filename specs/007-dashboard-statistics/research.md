# Research: Dashboard Statistics

**Feature**: 007-dashboard-statistics
**Date**: 2026-02-26

## R-001: Streak Calculation Algorithm

**Decision**: Compute streaks by fetching all completed session end dates, extracting unique calendar days, sorting descending, and iterating to find consecutive day sequences.

**Rationale**: For a single-user app with hundreds to low thousands of sessions, fetching all end dates (lightweight — only one column) and computing in JavaScript is simpler and more maintainable than complex SQL window functions. date-fns provides `differenceInCalendarDays()` and `startOfDay()` for reliable day boundary handling.

**Alternatives considered**:
- PostgreSQL window functions with `LAG()` — more efficient at scale but overly complex for single-user volume; harder to test and debug.
- Storing streak as a materialized column updated on each session completion — premature optimization; adds mutation complexity for a read-only feature.

**Implementation approach**:
1. Query all completed sessions: `SELECT DISTINCT DATE(endedAt) FROM FastingSession WHERE userId = ? AND endedAt IS NOT NULL ORDER BY date DESC`
2. Via Prisma: `findMany` with `select: { endedAt: true }`, then extract unique dates in JS
3. Walk dates backward from today: if today has a fast, streak starts at 1; increment for each consecutive prior day
4. Track best streak as the longest consecutive sequence found during the full walk

## R-002: ISO Week and Calendar Month Boundaries

**Decision**: Use date-fns `startOfISOWeek()` and `startOfMonth()` to compute period boundaries, then filter sessions with Prisma `gte`/`lt` date range queries.

**Rationale**: date-fns 4 is already a project dependency and provides reliable ISO 8601 week handling (Monday start). Using date range filters at the database level is more efficient than fetching all sessions and filtering in JS.

**Alternatives considered**:
- Moment.js — not in project dependencies; date-fns already available.
- Raw SQL `DATE_TRUNC` — works but bypasses Prisma's type safety; less maintainable.

**Implementation approach**:
1. Compute boundaries: `const weekStart = startOfISOWeek(new Date())`, `const monthStart = startOfMonth(new Date())`
2. Query: `prisma.fastingSession.findMany({ where: { userId, endedAt: { not: null, gte: weekStart } } })`
3. Calculate count and sum of durations in JS from the result set

## R-003: Duration Formatting Pattern

**Decision**: Create a shared `formatDuration(ms: number): string` utility in `src/lib/format.ts` that returns "Xh Ym" format.

**Rationale**: Duration formatting is needed in StatsCards (average, longest, weekly/monthly hours) and is already done ad-hoc in FastingTimer.tsx and SessionCard.tsx. Extracting to a utility prevents duplication and ensures consistent formatting.

**Alternatives considered**:
- date-fns `formatDuration()` — outputs verbose English ("1 hour 30 minutes"), not the compact "1h 30m" format desired.
- Inline formatting in each component — already exists but inconsistent; this feature adds 4+ new formatting call sites.

**Implementation approach**:
```
function formatDuration(ms: number): string {
  const totalMinutes = Math.round(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m`;
}
```

## R-004: Extending Existing getStats() vs. New Function

**Decision**: Extend the existing `getStats()` function in `src/app/actions/fasting.ts` to include streak and period data in its return type, replacing the current `FastingStats` interface.

**Rationale**: The function is already called from `page.tsx` and passed to `FastingTimer`. Extending it keeps the single data-fetching call pattern and avoids a second round-trip. The current implementation fetches all sessions to compute stats — we can reuse that query and add streak/period calculations.

**Alternatives considered**:
- Separate `getStreaks()` and `getPeriodStats()` functions — would require multiple await calls in page.tsx; increases waterfall latency.
- New API route `GET /api/stats` — the epic mentions this as a key file, but the constitution (Principle III) prefers server actions over API routes for data fetching. An API route is appropriate for chart data (Epic 8) where GET semantics make more sense, but stats are fetched at page load time from a server component.

**Implementation approach**:
1. Extend `FastingStats` interface with: `currentStreak`, `bestStreak`, `thisWeek: { count, totalHours }`, `thisMonth: { count, totalHours }`
2. In `getStats()`, after the existing session query, add streak computation and period queries
3. Return the enriched stats object

## R-005: Skeleton Loading Pattern

**Decision**: Use Tailwind's `animate-pulse` utility (matching the existing `SessionCardSkeleton` pattern) for stat card skeletons. Wrap the stats section in React Suspense or use conditional rendering based on the stats prop.

**Rationale**: `animate-pulse` is already established in the codebase (SessionCardSkeleton.tsx). The epic's design spec mentions "shimmer" but the existing pattern uses pulse, and consistency within the app is more important than matching the epic's exact wording.

**Alternatives considered**:
- Custom shimmer via `::after` pseudo-element — mentioned in epic spec but not currently used anywhere in the app; would introduce a new animation pattern.
- React Suspense boundary with `loading.tsx` — not applicable since stats are passed as props from the server component, not fetched client-side.

**Implementation approach**:
1. Create `StatsCardSkeleton.tsx` with pulse animation matching stat card dimensions
2. In `StatsCards.tsx`, show skeleton when `stats` is null (loading/no data)
3. Stats are passed as props, so loading state is managed by the parent server component
