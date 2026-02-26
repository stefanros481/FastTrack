# Tasks: Dashboard Charts

**Input**: Design documents from `/specs/008-dashboard-charts/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/chart-data-api.md, quickstart.md

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: Install dependencies and create shared components needed by all charts

- [X] T001 Install recharts dependency via `bun add recharts`
- [X] T002 [P] Create reusable EmptyState component in src/components/EmptyState.tsx — accepts icon (LucideIcon), heading (string), and description (string) props. Uses design tokens: icon `text-[--color-text-muted]`, heading `text-xl font-semibold`, description `text-sm text-[--color-text-muted]`. Centered layout with `py-12`.
- [X] T003 [P] Create ChartSkeleton component in src/components/ChartSkeleton.tsx — three skeleton cards matching chart card dimensions (`bg-[--color-card] rounded-2xl p-4`). Each contains a pulse-animated rectangle placeholder for chart area (h-48 for bar charts, h-40 for donut). Follow the pattern from src/components/StatsCardSkeleton.tsx.

---

## Phase 2: Foundational (API Endpoint)

**Purpose**: Chart data API endpoint — MUST complete before any chart component can render real data

**⚠️ CRITICAL**: All chart components depend on this endpoint

- [X] T004 Create GET /api/stats/charts endpoint in src/app/api/stats/charts/route.ts — implement per contracts/chart-data-api.md. Auth check via `auth()`, return 401 if no session. Accept `range` query param (7/30/90, default 7). Query all completed sessions (`endedAt IS NOT NULL`, scoped to `userId`) via Prisma. Also query `UserSettings` for `defaultGoalMinutes`. Compute and return JSON with four fields:
  - `duration`: Array of `{ date, durationHours }` for sessions within the range (filtered by `endedAt >= now - range days`), ordered by endedAt ascending. `durationHours` rounded to 1 decimal.
  - `weekly`: Array of 12 `{ weekStart, totalHours }` entries — one per ISO week (Monday start via date-fns `startOfISOWeek`), ordered chronologically oldest-first. Include zero-hour entries for weeks with no sessions. `totalHours` rounded to 1 decimal.
  - `goalRate`: `{ hit, total, percentage }` — `total` = sessions with `goalMinutes != null`, `hit` = those where `(endedAt - startedAt) >= goalMinutes`. `percentage` = Math.round(hit/total*100) or 0 if total is 0. Computed across ALL completed sessions (not range-filtered).
  - `defaultGoalHours`: `defaultGoalMinutes / 60` or `null` if not set.

**Checkpoint**: API endpoint returns correct JSON. Verify with: navigate to `/api/stats/charts?range=7` in browser.

---

## Phase 3: User Story 1 — Duration Chart (Priority: P1) 🎯 MVP

**Goal**: Bar chart showing individual session durations with 7/30/90-day range selector and goal line overlay

**Independent Test**: Navigate to Insights tab, see bar chart with one bar per session. Switch between time ranges. If default goal is set, see a dashed yellow line at goal hours.

### Implementation for User Story 1

- [X] T005 [US1] Create DurationChart component in src/components/DurationChart.tsx — client component (`"use client"`). Fetches data from `/api/stats/charts?range={range}` using `useState` + `useEffect`. Contains:
  - Time range selector: three pill buttons ("7 days", "30 days", "90 days") above the chart. Active pill: `bg-[--color-primary] text-white rounded-full px-4 py-1.5 text-sm font-semibold`. Inactive pill: `bg-[--color-primary-light] text-[--color-primary-dark] rounded-full px-4 py-1.5 text-sm font-semibold`. Switching range re-fetches data.
  - Recharts `<ResponsiveContainer width="100%" height={200}>` wrapping a `<BarChart>` with `<Bar dataKey="durationHours" fill="var(--color-primary)" radius={[4,4,0,0]} />`.
  - X-axis: `<XAxis dataKey="date" />` with tick formatter showing date in short locale format (e.g., "Feb 20"). `tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }}`.
  - Y-axis: `<YAxis />` showing hours. `tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }}`. Label "hours" optional.
  - Goal line: If `defaultGoalHours` is present, render `<ReferenceLine y={defaultGoalHours} stroke="var(--color-warning)" strokeDasharray="6 4" />`.
  - Wrapped in chart card: `bg-[--color-card] dark:bg-slate-900 rounded-2xl p-4`.
  - Title: "Duration" in `text-sm font-semibold text-[--color-text-muted] uppercase tracking-wider mb-3`.
  - Empty state: If `duration` array is empty, show `<EmptyState>` with BarChart3 icon, "No fasts yet", "Complete a fast to see your duration chart".
  - Loading state: While fetching, show skeleton placeholder (pulse-animated div h-[200px]).
  - Entrance animation: `motion-safe:animate-fade-in` on the chart card wrapper.

- [X] T006 [US1] Integrate DurationChart into dashboard view in src/components/FastingTimer.tsx — import DurationChart and render it after `<StatsCards>` inside the `view === "dashboard"` block. No props needed (component self-fetches).

**Checkpoint**: Duration chart visible on Insights tab. Range switching works. Goal line appears if default goal is set.

---

## Phase 4: User Story 2 — Weekly Totals Chart (Priority: P2)

**Goal**: Bar chart showing total fasting hours per week for the last 12 weeks

**Independent Test**: See bar chart with one bar per week. Weeks with no fasting show as zero-height bars.

### Implementation for User Story 2

- [X] T007 [US2] Create WeeklyChart component in src/components/WeeklyChart.tsx — client component. Reads `weekly` data from the same fetch as DurationChart (share data via lifting state or re-fetch — see T009). Contains:
  - Recharts `<ResponsiveContainer width="100%" height={200}>` wrapping `<BarChart>` with `<Bar dataKey="totalHours" fill="var(--color-primary)" radius={[4,4,0,0]} />`.
  - X-axis: `<XAxis dataKey="weekStart" />` with tick formatter showing "MMM d" (e.g., "Feb 17"). `tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }}`.
  - Y-axis: `<YAxis />` showing hours. `tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }}`.
  - Chart card wrapper: same styling as DurationChart (`bg-[--color-card] dark:bg-slate-900 rounded-2xl p-4`).
  - Title: "Weekly Totals" in same muted uppercase style.
  - Empty state: If all `totalHours` are 0 (or no sessions at all), show `<EmptyState>` with Calendar icon, "No fasts yet", "Start fasting to track your weekly progress".
  - Loading state: skeleton placeholder while fetching.
  - Entrance animation: `motion-safe:animate-fade-in`.

- [X] T008 [US2] Integrate WeeklyChart into dashboard view in src/components/FastingTimer.tsx — render after DurationChart inside the dashboard view block.

**Checkpoint**: Weekly chart visible below duration chart. Shows 12 weeks with proper labels.

---

## Phase 5: User Story 3 — Goal Hit Rate (Priority: P3)

**Goal**: Donut chart showing percentage of fasts that met the goal

**Independent Test**: See donut chart with percentage in center. Only sessions with goals are counted.

### Implementation for User Story 3

- [X] T009 [US3] Create GoalRateChart component in src/components/GoalRateChart.tsx — client component. Reads `goalRate` data from chart endpoint. Contains:
  - Recharts `<ResponsiveContainer width="100%" height={180}>` wrapping `<PieChart>` with a single `<Pie>` configured as a donut: `innerRadius={60} outerRadius={80} dataKey="value" startAngle={90} endAngle={-270}`.
  - Two data segments: `{ name: "Hit", value: goalRate.hit, fill: "var(--color-success)" }` and `{ name: "Missed", value: goalRate.total - goalRate.hit, fill: "var(--color-primary-light)" }`.
  - Center label: Positioned absolutely (or via Recharts custom label) — percentage as `text-3xl font-bold text-[--color-text]` and "goal hit rate" as `text-sm text-[--color-text-muted]` below it.
  - Chart card wrapper: same styling (`bg-[--color-card] dark:bg-slate-900 rounded-2xl p-4`).
  - Title: "Goal Rate" in muted uppercase style.
  - Empty state: If `goalRate.total === 0`, show `<EmptyState>` with Target icon, "No goals tracked", "Set a fasting goal to track your hit rate".
  - 100% case: Full ring in success color.
  - Loading state: skeleton placeholder.
  - Entrance animation: `motion-safe:animate-fade-in`.

- [X] T010 [US3] Integrate GoalRateChart into dashboard view in src/components/FastingTimer.tsx — render after WeeklyChart inside the dashboard view block.

**Checkpoint**: Donut chart visible with correct percentage. Sessions without goals are excluded.

---

## Phase 6: User Story 4 — Loading States (Priority: P4)

**Goal**: Charts show appropriate loading skeletons while data is fetched

**Independent Test**: Throttle network, navigate to Insights, see skeleton placeholders before charts render.

### Implementation for User Story 4

- [X] T011 [US4] Refactor chart data fetching — create a shared `useChartData` hook in src/hooks/useChartData.ts that manages the fetch lifecycle for `/api/stats/charts`. Returns `{ data, isLoading, error, setRange }`. Used by DurationChart (passes range), WeeklyChart, and GoalRateChart. This consolidates the 3 charts into a single API call. Update DurationChart, WeeklyChart, and GoalRateChart to accept data as props instead of self-fetching.
- [X] T012 [US4] Create chart data orchestrator in src/components/FastingTimer.tsx — call `useChartData()` in the dashboard view section. Pass `isLoading` state to render `<ChartSkeleton />` (from T003) while loading. Pass chart data as props to DurationChart, WeeklyChart, GoalRateChart once loaded. Ensure smooth transition (no layout shift) using consistent card heights.

**Checkpoint**: Skeletons appear immediately on navigation to Insights. Charts animate in smoothly when data arrives.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final validation, responsive testing, build verification

- [X] T013 Responsive validation — verify all three charts render correctly at 375px viewport width. Ensure no horizontal scrolling, axis labels remain legible, and chart cards stack vertically. Adjust Recharts tick intervals or font sizes if needed.
- [X] T014 Run build verification via `bun run build` — fix any TypeScript or build errors.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on T001 (recharts installed)
- **US1 (Phase 3)**: Depends on Phase 2 (API endpoint) + T002 (EmptyState)
- **US2 (Phase 4)**: Depends on Phase 2 (API endpoint) + T002 (EmptyState)
- **US3 (Phase 5)**: Depends on Phase 2 (API endpoint) + T002 (EmptyState)
- **US4 (Phase 6)**: Depends on US1, US2, US3 (refactors their data fetching)
- **Polish (Phase 7)**: Depends on all previous phases

### User Story Dependencies

- **US1 (P1)**: Independent after Phase 2 — no dependencies on other stories
- **US2 (P2)**: Independent after Phase 2 — no dependencies on US1 (uses same API endpoint)
- **US3 (P3)**: Independent after Phase 2 — no dependencies on US1/US2
- **US4 (P4)**: Depends on US1, US2, US3 being implemented (refactors their data fetching into shared hook)

### Within Each User Story

- Chart component created first
- Then integrated into FastingTimer dashboard view
- Each story testable after integration

### Parallel Opportunities

- T002 and T003 can run in parallel (different files)
- US1, US2, US3 can theoretically run in parallel after Phase 2, but since they all modify FastingTimer.tsx for integration, sequential execution (P1→P2→P3) is recommended

---

## Parallel Example: Phase 1

```bash
# Launch setup tasks in parallel:
Task: "Create EmptyState component in src/components/EmptyState.tsx"
Task: "Create ChartSkeleton component in src/components/ChartSkeleton.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (install recharts, create EmptyState + ChartSkeleton)
2. Complete Phase 2: Foundational (API endpoint)
3. Complete Phase 3: User Story 1 (Duration Chart)
4. **STOP and VALIDATE**: Duration chart renders with range selector and goal line
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → API endpoint ready
2. Add US1 (Duration Chart) → Test independently → Deploy (MVP!)
3. Add US2 (Weekly Chart) → Test independently → Deploy
4. Add US3 (Goal Rate Donut) → Test independently → Deploy
5. Add US4 (Loading States) → Refactor to shared hook → Deploy
6. Polish → Responsive validation + build check → Final deploy

---

## Notes

- Recharts components require `"use client"` directive
- All chart colors use CSS custom properties (`var(--color-*)`) for design token compliance
- The API endpoint returns all three chart datasets in a single response to minimize HTTP requests
- Goal hit rate is computed across ALL completed sessions (not filtered by duration chart range)
- Weekly chart always shows 12 weeks regardless of duration chart range selection
- `defaultGoalHours` for the goal line comes from UserSettings, not per-session goals
