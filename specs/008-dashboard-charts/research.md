# Research: Dashboard Charts

**Feature**: 008-dashboard-charts
**Date**: 2026-02-26

## R1: Recharts Integration in Next.js App Router

**Decision**: Use Recharts with `"use client"` directive in chart components. Recharts requires DOM access and cannot render in server components.

**Rationale**: The constitution (Principle III) explicitly permits client components for charts. Recharts is the locked chart library in the tech stack. It provides `<ResponsiveContainer>` for responsive sizing and built-in animation support.

**Alternatives considered**:
- Server-side chart rendering (e.g., SVG generation): Rejected — Recharts is DOM-dependent; SSR chart libraries would require a tech stack change.
- Embedding charts in an iframe: Rejected — unnecessary complexity for a single-user app.

## R2: Chart Data Endpoint Design

**Decision**: Create `GET /api/stats/charts` that returns all three chart datasets in a single response. Accept a `range` query parameter (7, 30, 90) for the duration chart. Weekly totals and goal hit rate are computed for all-time/last 12 weeks regardless of range.

**Rationale**: A single endpoint reduces HTTP requests. The spec calls for a "dedicated data endpoint" (FR-015). Using a GET route follows the constitution's allowance for API routes with GET semantics. The range parameter only affects the duration chart data — weekly totals always show 12 weeks and goal hit rate is all-time.

**Alternatives considered**:
- Three separate endpoints (one per chart): Rejected — unnecessary overhead for a single user; all three queries hit the same table.
- Extending the existing server action `getStats()`: Rejected — spec explicitly calls for a dedicated endpoint; charts render client-side and benefit from GET caching semantics.
- Extending `/api/sessions`: Rejected — different data shape; sessions endpoint is paginated raw data, charts need aggregations.

## R3: Duration Chart — Time Range Implementation

**Decision**: Filter sessions by `endedAt >= (now - range days)` in the database query. Return individual sessions with `date` (ISO string) and `durationHours` (number). The client renders one bar per session.

**Rationale**: Filtering in the DB is more efficient than fetching all sessions and filtering client-side. Returning individual sessions (not daily aggregates) matches the spec: "each bar represents one completed fasting session."

**Alternatives considered**:
- Daily aggregation (sum durations per day): Rejected — spec says one bar per session, not per day.
- Client-side filtering from a large dataset: Rejected — wasteful when 90-day window could have hundreds of sessions.

## R4: Weekly Totals — ISO Week Aggregation

**Decision**: Aggregate in application code using date-fns `startOfISOWeek()`. Query the last 12 ISO weeks of sessions from the DB, then group by ISO week in TypeScript.

**Rationale**: PostgreSQL's `date_trunc('week', ...)` uses ISO weeks (Monday start), which aligns with the spec's assumption. However, grouping in app code using date-fns gives us consistent behavior with the rest of the app (Epic 7 already uses `startOfISOWeek`). For a single user's data volume, this is efficient.

**Alternatives considered**:
- SQL GROUP BY with date_trunc: Viable but adds SQL complexity; app-code grouping is simpler and consistent with Epic 7's approach.

## R5: Goal Hit Rate Calculation

**Decision**: Compute server-side: count sessions where `goalMinutes IS NOT NULL` (denominator), then count those where `durationMinutes >= goalMinutes` (numerator). Return `{ hit, total, percentage }`.

**Rationale**: Matches spec FR-007 exactly: "exclude sessions without a goal from both numerator and denominator." Computed server-side to keep the client simple.

**Alternatives considered**:
- Client-side calculation from raw session data: Rejected — the endpoint should return pre-computed values to keep the client lightweight.

## R6: Goal Line Overlay Source

**Decision**: Read the user's `defaultGoalMinutes` from `UserSettings` and include it in the API response. The duration chart component renders a `<ReferenceLine>` at that value (converted to hours).

**Rationale**: Spec says "the goal line reflects the current default goal, not historical per-session goals." The `UserSettings.defaultGoalMinutes` field already exists in the schema.

**Alternatives considered**:
- Using per-session goalMinutes for the line: Rejected — spec explicitly says use the default goal from settings.

## R7: Empty State Component

**Decision**: Create a reusable `EmptyState` component with icon, heading, and description props. Used by all three charts when no data is available.

**Rationale**: The plan for US-8.1 specifies "use EmptyState component" pattern. A shared component avoids duplication across three charts.

## R8: Loading Skeletons

**Decision**: Create `ChartSkeleton` component with variants matching each chart card's dimensions. Use pulse animation matching the existing `StatsCardSkeleton` pattern.

**Rationale**: FR-010 requires loading skeletons. Consistent with the skeleton pattern established in Epic 7.

## R9: Recharts Installation

**Decision**: Install `recharts` via `bun add recharts`. No additional Recharts sub-packages needed — the main package includes BarChart, PieChart, ResponsiveContainer, and all required components.

**Rationale**: Recharts is the locked chart library per the constitution's Technical Stack table. Bun is the project's package manager (per MEMORY.md).
