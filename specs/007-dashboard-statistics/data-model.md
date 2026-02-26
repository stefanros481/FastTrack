# Data Model: Dashboard Statistics

**Feature**: 007-dashboard-statistics
**Date**: 2026-02-26

## Existing Entities (No Schema Changes)

This feature requires **no database schema changes**. All statistics are derived from the existing `FastingSession` model via aggregate queries and in-memory computation.

### FastingSession (existing — read-only for this feature)

| Field | Type | Notes |
|-------|------|-------|
| id | String (cuid) | Primary key |
| userId | String | Foreign key to User; all queries scoped to this |
| startedAt | DateTime | Fast start timestamp |
| endedAt | DateTime? | Fast end timestamp; `null` = active/in-progress |
| goalMinutes | Int? | Optional goal for this session |
| notes | String? | Up to 280 chars |
| createdAt | DateTime | Record creation |
| updatedAt | DateTime | Last update |

**Filter rule**: All statistics MUST use `WHERE endedAt IS NOT NULL` to exclude active sessions.

## Derived Data Structures (TypeScript interfaces — not persisted)

### FastingStats (extended)

```
interface FastingStats {
  // Existing fields
  totalFasts: number;          // COUNT of completed sessions
  totalHours: number;          // SUM of all durations in hours
  avgHours: number;            // AVERAGE duration in hours
  longestFast: number;         // MAX duration in hours
  goalsMet: number;            // COUNT where duration >= goalMinutes

  // New fields (Epic 7)
  currentStreak: number;       // Consecutive calendar days ending today with ≥1 completed fast
  bestStreak: number;          // Longest consecutive-day streak ever
  thisWeek: PeriodSummary;     // Current ISO week (Mon–Sun)
  thisMonth: PeriodSummary;    // Current calendar month
}

interface PeriodSummary {
  count: number;               // Number of completed fasts in period
  totalHours: number;          // Total fasting hours in period
}
```

### Streak Computation Model

**Input**: Array of unique calendar dates (derived from `endedAt` values)
**Algorithm**:
1. Extract `endedAt` from all completed sessions
2. Map to unique calendar dates (using `startOfDay()`)
3. Sort dates descending
4. Walk from today backward:
   - If today has a fast: `currentStreak = 1`, check yesterday, etc.
   - If today has no fast: `currentStreak = 0`
5. Continue full walk to find `bestStreak` (longest consecutive sequence anywhere)

**Day boundary rule**: A session's day is determined by its `endedAt` timestamp.
**Same-day rule**: Multiple sessions ending on the same calendar day count as one streak day.

### Period Query Model

**This Week**: `endedAt >= startOfISOWeek(today) AND endedAt IS NOT NULL`
**This Month**: `endedAt >= startOfMonth(today) AND endedAt IS NOT NULL`

Both queries return session arrays; count and total hours computed in JS.

## Query Patterns

| Stat | Query Strategy |
|------|---------------|
| Total fasts | `COUNT(*)` from existing session fetch |
| Average duration | `SUM(durations) / COUNT` in JS |
| Longest fast | `MAX(durations)` in JS |
| Current streak | Unique dates walk from today |
| Best streak | Full unique dates walk |
| This week | Date-range filtered query, aggregate in JS |
| This month | Date-range filtered query, aggregate in JS |

## Data Flow

```
page.tsx (Server Component)
  └─ await getStats()  [server action]
       ├─ getUserId()  [auth check]
       ├─ prisma.fastingSession.findMany(...)  [all completed sessions]
       ├─ compute basic stats (total, avg, longest, goals)
       ├─ compute streaks (unique dates walk)
       ├─ prisma.fastingSession.findMany(...)  [this week filter]
       ├─ prisma.fastingSession.findMany(...)  [this month filter]
       └─ return FastingStats
  └─ pass stats to FastingTimer (Client Component)
       └─ StatsCards receives stats prop
            ├─ stats === null → StatsCardSkeleton
            └─ stats !== null → render 7 stat cards
```
