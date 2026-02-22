# Epic 8: Dashboard — Charts

Three charts rendered client-side with Recharts, data fetched from `GET /api/stats`. All charts are scoped to the authenticated user.

---

## US-8.1 — View duration chart

*As a user, I want to see a chart of my fasting durations over time so that I can spot trends.*

**Acceptance criteria:**
- Bar chart showing each session's duration
- Time range selector: 7 days, 30 days, 90 days
- Goal line overlay if a default goal is set
- Rendered client-side with Recharts

**Design:**
- Bar fill: `--color-primary` (`#4f46e5`)
- Goal line overlay: `--color-warning` (`#ca8a04`), dashed
- Time range selector pills: `rounded-full`; active: `bg-[--color-primary] text-white`; inactive: `bg-[--color-primary-light] text-[--color-primary-dark]`
- Chart card wrapper: `bg-[--color-card]`, `rounded-2xl`, `p-4`
- Axis labels / tick text: Muted level — `text-sm text-[--color-text-muted]`
- Empty state (no data): use EmptyState component — icon, heading level title, body level description

---

## US-8.2 — View weekly totals chart

*As a user, I want to see how many hours I fasted each week so that I can track consistency.*

**Acceptance criteria:**
- Bar chart with one bar per week
- Y-axis: total hours fasted
- Shows the last 8–12 weeks

**Design:**
- Bar fill: `--color-primary`
- Chart card: `bg-[--color-card]`, `rounded-2xl`, `p-4`
- Week labels on x-axis: Muted level — `text-sm text-[--color-text-muted]`
- Empty state: EmptyState component pattern

---

## US-8.3 — View goal hit rate

*As a user, I want to see what percentage of my fasts hit the goal so that I know how disciplined I've been.*

**Acceptance criteria:**
- Donut chart showing hit rate percentage
- Denominator = sessions with a goal set
- Numerator = sessions where duration >= goal

**Design:**
- Hit segment: `--color-success` (`#059669`)
- Miss segment: `--color-primary-light` (`#e0e7ff`) as muted contrast
- Center label (percentage): Display level — `text-3xl font-bold text-[--color-text]`
- Sub-label ("goal hit rate"): Muted — `text-sm text-[--color-text-muted]`
- Chart card: `bg-[--color-card]`, `rounded-2xl`, `p-4`

---

**Key files:** `src/components/DurationChart.tsx`, `src/components/WeeklyChart.tsx`, `src/components/GoalRateChart.tsx`, `src/app/api/stats/route.ts`
