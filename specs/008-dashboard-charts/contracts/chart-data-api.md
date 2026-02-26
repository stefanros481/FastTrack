# API Contract: Chart Data Endpoint

**Feature**: 008-dashboard-charts
**Date**: 2026-02-26

## GET /api/stats/charts

Returns pre-aggregated chart data for the authenticated user's completed fasting sessions.

### Authentication

- Requires valid Auth.js session (JWT)
- Returns `401 Unauthorized` if no session

### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| range | string | No | "7" | Time range for duration chart: "7", "30", or "90" (days) |

Invalid `range` values fall back to "7".

### Success Response (200)

```json
{
  "duration": [
    { "date": "2026-02-20T14:30:00.000Z", "durationHours": 16.5 },
    { "date": "2026-02-21T15:00:00.000Z", "durationHours": 18.2 }
  ],
  "weekly": [
    { "weekStart": "2026-02-17", "totalHours": 34.7 },
    { "weekStart": "2026-02-10", "totalHours": 28.3 },
    { "weekStart": "2026-02-03", "totalHours": 0 }
  ],
  "goalRate": {
    "hit": 7,
    "total": 10,
    "percentage": 70
  },
  "defaultGoalHours": 16
}
```

### Field Details

**duration** (array): One entry per completed session within the selected range.
- `date`: ISO timestamp of `endedAt` (used for x-axis positioning)
- `durationHours`: Session duration in hours, rounded to 1 decimal

**weekly** (array): One entry per ISO week for the last 12 weeks. Ordered chronologically (oldest first).
- `weekStart`: ISO date string of the Monday starting each week (format: "YYYY-MM-DD")
- `totalHours`: Sum of session durations for that week, rounded to 1 decimal. Zero if no sessions.

**goalRate** (object): Aggregated across ALL completed sessions (not range-filtered).
- `hit`: Number of sessions where actual duration >= goalMinutes
- `total`: Number of sessions that had a goalMinutes value set
- `percentage`: Integer percentage (0–100). Returns 0 when total is 0.

**defaultGoalHours** (number | null): User's default goal from UserSettings, converted to hours. `null` if no default goal is set.

### Error Responses

| Status | Body | Condition |
|--------|------|-----------|
| 401 | `{ "error": "Unauthorized" }` | No valid session |
| 500 | `{ "error": "Internal server error" }` | Unexpected server error |

### Empty Data Behavior

- If user has no completed sessions: `duration: []`, `weekly: []` (12 entries all with `totalHours: 0`), `goalRate: { hit: 0, total: 0, percentage: 0 }`
- If user has sessions but none in selected range: `duration: []` (weekly and goalRate still populated from all-time data)
- Weekly array always contains exactly 12 entries (current week + 11 prior weeks), with `totalHours: 0` for weeks with no sessions
