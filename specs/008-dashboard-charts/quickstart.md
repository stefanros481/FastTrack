# Quickstart: Dashboard Charts

**Feature**: 008-dashboard-charts
**Date**: 2026-02-26

## Prerequisites

- Existing FastTrack app running locally (`bun run dev`)
- At least 3 completed fasting sessions in the database (some with goals, some without)
- User has a default goal set in UserSettings (for goal line overlay testing)

## Setup

1. Install Recharts:
   ```bash
   bun add recharts
   ```

2. No database migrations needed — this feature is read-only on existing tables.

## Integration Points

### Where Charts Appear

Charts render on the **Insights** (dashboard) view in `FastingTimer.tsx`. Currently this view shows only `<StatsCards>`. Charts are added below the stats cards.

```
Dashboard View (view === "dashboard")
├── <StatsCards stats={stats} />        ← existing
├── <DurationChart />                   ← new
├── <WeeklyChart />                     ← new
└── <GoalRateChart />                   ← new
```

### Data Flow

1. When dashboard view mounts, chart components call `GET /api/stats/charts?range=7`
2. API route authenticates via `auth()`, queries Prisma, aggregates data
3. JSON response feeds into Recharts components
4. Range selector in DurationChart triggers re-fetch with new `range` param

### Key Design Tokens

| Token | Usage |
|-------|-------|
| `--color-primary` (#4f46e5) | Bar fill color |
| `--color-warning` (#ca8a04) | Goal line (dashed) |
| `--color-success` (#059669) | Goal hit segment in donut |
| `--color-primary-light` (#e0e7ff) | Goal miss segment in donut, inactive pills |
| `--color-card` (#FFFFFF) | Chart card background |
| `--color-text` (#1E293B) | Center percentage label |
| `--color-text-muted` (#64748B) | Axis labels, sub-labels |

### Verification

After implementation, verify:

1. Navigate to Insights tab → see 3 chart cards below stat cards
2. Duration chart: bars per session, range selector works (7/30/90)
3. If default goal set: dashed yellow line at goal hours
4. Weekly chart: bars per week, 12 weeks shown
5. Donut chart: percentage in center, colored segments
6. No data: empty state messages
7. Mobile (375px): charts scale down, no horizontal scroll
8. Build passes: `bun run build`
