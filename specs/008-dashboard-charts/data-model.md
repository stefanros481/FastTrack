# Data Model: Dashboard Charts

**Feature**: 008-dashboard-charts
**Date**: 2026-02-26

## Existing Entities (No Schema Changes)

This feature is read-only — no new database tables or columns are needed.

### FastingSession (existing)

| Field | Type | Relevance to Charts |
|-------|------|-------------------|
| id | String (CUID) | — |
| userId | String | Scoping all queries to authenticated user |
| startedAt | DateTime | Duration calculation, date grouping |
| endedAt | DateTime? | Duration calculation; `null` = active (excluded) |
| goalMinutes | Int? | Goal hit rate calculation |
| notes | String? | Not used by charts |

**Filter**: All chart queries use `WHERE userId = :userId AND endedAt IS NOT NULL` to include only completed sessions.

### UserSettings (existing)

| Field | Type | Relevance to Charts |
|-------|------|-------------------|
| defaultGoalMinutes | Int? | Goal line overlay on duration chart |
| userId | String | Scoping to authenticated user |

## Derived Data Shapes (API Response)

These are computed at request time, not persisted.

### ChartDataResponse

```typescript
interface ChartDataResponse {
  duration: DurationDataPoint[];
  weekly: WeeklyDataPoint[];
  goalRate: GoalRateData;
  defaultGoalHours: number | null;
}
```

### DurationDataPoint

One entry per completed session within the selected time range.

```typescript
interface DurationDataPoint {
  date: string;       // ISO date string (e.g., "2026-02-20T06:00:00.000Z")
  durationHours: number;  // Duration in hours (e.g., 16.5)
}
```

### WeeklyDataPoint

One entry per ISO week (last 12 weeks).

```typescript
interface WeeklyDataPoint {
  weekStart: string;    // ISO date of Monday (e.g., "2026-02-17")
  totalHours: number;   // Sum of durations in hours for that week
}
```

### GoalRateData

Aggregated goal hit statistics.

```typescript
interface GoalRateData {
  hit: number;          // Sessions where duration >= goal
  total: number;        // Sessions that had a goal set
  percentage: number;   // hit / total * 100 (0 if total is 0)
}
```

## Data Flow

```
Browser (chart component)
  → GET /api/stats/charts?range=7
    → auth() check
    → Prisma query: FastingSession WHERE userId AND endedAt IS NOT NULL
    → Prisma query: UserSettings WHERE userId (for defaultGoalMinutes)
    → Aggregate in TypeScript (duration points, weekly grouping, goal rate)
  ← JSON: { duration, weekly, goalRate, defaultGoalHours }
  → Recharts renders charts
```
