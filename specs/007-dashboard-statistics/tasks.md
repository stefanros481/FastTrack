# Tasks: Dashboard Statistics

**Input**: Design documents from `/specs/007-dashboard-statistics/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: No test framework configured. Tests are not included.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: No new dependencies or schema changes required. Skip to Foundational.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared utilities and interface extensions that all user stories depend on

**CRITICAL**: No user story work can begin until this phase is complete

- [x] T001 [P] Create `formatDuration(ms: number): string` utility in `src/lib/format.ts` — accepts milliseconds, returns compact "Xh Ym" format (e.g., `formatDuration(59400000)` → `"16h 30m"`). Export as named export. Handle zero as `"0h 0m"`. Round to nearest minute.

- [x] T002 [P] Extend `FastingStats` interface and `PeriodSummary` interface in `src/app/actions/fasting.ts` — add `currentStreak: number`, `bestStreak: number`, `thisWeek: PeriodSummary`, `thisMonth: PeriodSummary` to the existing `FastingStats` interface. Add new `PeriodSummary` interface with `count: number` and `totalHours: number`. Keep all existing fields (`totalFasts`, `totalHours`, `avgHours`, `longestFast`, `goalsMet`). Update `getStats()` return to temporarily stub the new fields with `0` / `{ count: 0, totalHours: 0 }` so existing consumers don't break.

**Checkpoint**: Foundational utilities ready — user story implementation can now begin

---

## Phase 3: User Story 1 — View Summary Statistics (Priority: P1) MVP

**Goal**: Display total fasts, average duration, and longest fast as stat cards on the dashboard view

**Independent Test**: Navigate to dashboard with completed fasts → see 3 stat cards with correct values. With no fasts → see zero-state cards ("0 fasts", "0h 0m").

### Implementation for User Story 1

- [x] T003 [US1] Create `StatsCards` client component in `src/components/StatsCards.tsx` — accepts `stats: FastingStats | null` prop. Render a responsive grid (`grid grid-cols-2 gap-3` on mobile, expanding as needed). For US1, render 3 stat cards: **Total Fasts** (icon: `BarChart3`), **Average Duration** (icon: `Clock`, use `formatDuration` from `src/lib/format.ts` converting `avgHours` to ms), **Longest Fast** (icon: `Award`, use `formatDuration` converting `longestFast` to ms). Each card: `bg-[--color-card] dark:bg-slate-900 rounded-2xl p-4` with stat value as `text-3xl font-bold text-[--color-text]` and label as `text-sm text-[--color-text-muted]`. In the 2-col grid, if the last row has an odd card, it remains single-width in the left column (do not span full width — period summary cards in US3 will fill the full-width role). When `stats` is null, render zero-state values ("0", "0h 0m", "0 days" per FR-011). Add `"use client"` directive. Import icons from `lucide-react`.

- [x] T004 [US1] Integrate `StatsCards` into `FastingTimer` dashboard view in `src/components/FastingTimer.tsx` — replace the existing inline stat cards in the "dashboard" view section (approximately lines 348–399) with `<StatsCards stats={stats} />`. Import `StatsCards` from `./StatsCards`. Ensure the `stats` prop is threaded through from the `FastingTimer` component props. Remove the old inline stat rendering code.

- [x] T005 [US1] Update `FastingTimer` props type in `src/components/FastingTimer.tsx` to accept the extended `FastingStats` type (with the new fields). Update the import of `FastingStats` from `@/app/actions/fasting`. Verify `src/app/page.tsx` already passes `stats` correctly (it should — `getStats()` returns the extended type from T002).

**Checkpoint**: Dashboard shows 3 summary stat cards. User Story 1 is independently functional and testable.

---

## Phase 4: User Story 2 — View Streak Statistics (Priority: P2)

**Goal**: Display current streak and best streak as stat cards

**Independent Test**: Complete fasts on consecutive days → current streak increments. Miss a day → current streak resets to 0. Best streak retains highest value.

### Implementation for User Story 2

- [x] T006 [US2] Implement streak computation in `getStats()` in `src/app/actions/fasting.ts` — using the existing completed-sessions query (which already filters `endedAt: { not: null }` per FR-008), extract unique calendar dates from `endedAt` values using `startOfDay()` from `date-fns`. Sort dates descending. Walk backward from today: if today has a fast, `currentStreak = 1`, increment for each consecutive prior day; if today has no fast, `currentStreak = 0`. Walk all dates to find `bestStreak` (longest consecutive sequence). Use `differenceInCalendarDays()` from `date-fns` to check consecutive days. Multiple sessions on the same day count as one streak day (use a `Set` of date strings for deduplication). Replace the stubbed `currentStreak` and `bestStreak` values.

- [x] T007 [US2] Add streak stat cards to `StatsCards` in `src/components/StatsCards.tsx` — add 2 new cards to the grid: **Current Streak** (icon: `Flame`, value: `"{n} days"`, value color: `text-[--color-primary]`) and **Best Streak** (icon: `Trophy`, value: `"{n} days"`, value color: `text-[--color-success]`). Import `Flame` and `Trophy` from `lucide-react`. Zero state: `"0 days"`.

**Checkpoint**: Dashboard shows 5 stat cards (3 summary + 2 streak). Streaks calculate correctly for consecutive days, gaps, and same-day multiples.

---

## Phase 5: User Story 3 — View Weekly and Monthly Summaries (Priority: P3)

**Goal**: Display "This Week" and "This Month" summary cards showing fast count and total hours

**Independent Test**: Complete fasts within the current week/month → cards show correct count and total hours. At the start of a new week/month with no fasts → cards show "0 fasts, 0h".

### Implementation for User Story 3

- [x] T008 [US3] Add period summary queries to `getStats()` in `src/app/actions/fasting.ts` — import `startOfISOWeek` and `startOfMonth` from `date-fns`. Compute `weekStart = startOfISOWeek(new Date())` and `monthStart = startOfMonth(new Date())`. Run two additional Prisma queries filtering completed sessions where `endedAt: { not: null, gte: weekStart }` (and `gte: monthStart` respectively), scoped to `userId` (maintaining the `endedAt: { not: null }` filter per FR-008). For each period, compute `count` (number of sessions) and `totalHours` (sum of durations in hours). Replace the stubbed `thisWeek` and `thisMonth` values. Consider reusing sessions already fetched for the main stats query — if `monthStart` encompasses all needed sessions, filter in JS rather than running a separate query.

- [x] T009 [US3] Add period summary cards to `StatsCards` in `src/components/StatsCards.tsx` — add 2 new cards: **This Week** (icon: `Calendar`, show `"{count} fasts"` as primary value and `"{totalHours}h"` as secondary line using `text-sm text-[--color-text-muted]`) and **This Month** (icon: `CalendarDays`, same format). These cards span the full width of the grid (`col-span-2` or similar) to visually differentiate from the single-stat cards. Import `Calendar` and `CalendarDays` from `lucide-react`. Zero state: `"0 fasts"` and `"0h"`.

**Checkpoint**: Dashboard shows all 7 stat cards. Weekly and monthly summaries accurately reflect the current ISO week and calendar month.

---

## Phase 6: User Story 4 — Statistics Loading State (Priority: P4)

**Goal**: Show skeleton placeholder cards while statistics are loading, with smooth entrance animation when data appears

**Independent Test**: Throttle network in DevTools → observe skeleton cards appear briefly before real data renders. No layout shift when transitioning from skeleton to real cards.

### Implementation for User Story 4

- [x] T010 [US4] Create `StatsCardSkeleton` component in `src/components/StatsCardSkeleton.tsx` — render a grid matching the StatsCards layout (same `grid grid-cols-2 gap-3`) with 7 placeholder cards. Each card: `bg-[--color-card] dark:bg-slate-900 rounded-2xl p-4 animate-pulse`. Inside each card: a `div` for the value placeholder (`h-8 w-20 bg-slate-200 dark:bg-slate-700 rounded`) and a `div` for the label placeholder (`h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded mt-2`). The last 2 cards (period summaries) span full width to match StatsCards layout. Export as default.

- [x] T011 [US4] Add Suspense boundary and entrance animation — in `src/components/FastingTimer.tsx`, wrap the `<StatsCards>` render with a React `<Suspense fallback={<StatsCardSkeleton />}>` boundary so the skeleton displays while the server streams stats data. Note: since `page.tsx` awaits `getStats()` before passing props, the Suspense boundary must be lifted to `page.tsx` around the `<FastingTimer>` component to enable streaming. Alternatively, if Suspense lifting is too invasive, accept that the skeleton only appears during initial full-page load (Next.js server render) and skip the `loading` prop — the skeleton file from T010 is still used as the Suspense fallback. Add `motion-safe:animate-fade-in` class to the stats grid wrapper in `StatsCards` for entrance animation when data appears.

**Checkpoint**: Loading state shows skeleton cards; data appears with fade-in animation; no layout shift.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final verification and refinements

- [x] T012 Verify responsive layout on 375px viewport in `src/components/StatsCards.tsx` — ensure all 7 stat cards are visible without horizontal scrolling. Adjust grid breakpoints if needed (`grid-cols-2` for mobile, cards stack properly). Period summary cards should be full-width.

- [x] T013 Verify stats refresh on dashboard navigation — confirm that `getStats()` is called each time the user navigates to the dashboard view (not cached between navigations). Test by: start a fast → stop it → switch to history → switch back to dashboard → verify new session is reflected in stats.

- [x] T014 Run quickstart.md verification steps from `specs/007-dashboard-statistics/quickstart.md` — walk through all 7 verification steps to confirm full feature readiness.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Skipped — no setup needed
- **Foundational (Phase 2)**: No dependencies — start immediately. T001 and T002 can run in parallel.
- **US1 (Phase 3)**: Depends on Phase 2 completion. T003 depends on T001 (formatDuration) and T002 (interface). T004 depends on T003. T005 depends on T004.
- **US2 (Phase 4)**: Depends on Phase 3 (needs StatsCards component to add cards to). T006 depends on T002. T007 depends on T003 and T006.
- **US3 (Phase 5)**: Depends on Phase 3 (needs StatsCards component). T008 depends on T002. T009 depends on T003 and T008.
- **US4 (Phase 6)**: Depends on Phase 3 (needs StatsCards to add loading state to). T010 is independent. T011 depends on T003 and T010.
- **Polish (Phase 7)**: Depends on all user stories being complete.

### User Story Dependencies

- **US1 (P1)**: Foundational only — no dependencies on other stories
- **US2 (P2)**: Depends on US1 (adds cards to StatsCards created in US1)
- **US3 (P3)**: Depends on US1 (adds cards to StatsCards created in US1)
- **US4 (P4)**: Depends on US1 (adds loading state to StatsCards created in US1)

Note: US2 and US3 are independent of each other and could run in parallel after US1 is complete.

### Parallel Opportunities

- T001 and T002 can run in parallel (Phase 2, different files)
- T006 and T008 could theoretically run in parallel (both modify `fasting.ts` but different sections — safer to run sequentially)
- T010 is independent of T006–T009 (creates a new file)
- US2 and US3 server-side work (T006, T008) is in the same file — run sequentially
- US2 and US3 client-side work (T007, T009) is in the same file — run sequentially

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 2: Foundational (T001, T002)
2. Complete Phase 3: User Story 1 (T003, T004, T005)
3. **STOP and VALIDATE**: Dashboard shows 3 basic stat cards with correct values and zero states
4. Deploy/demo if ready — immediate user value

### Incremental Delivery

1. Foundational (T001–T002) → shared utilities ready
2. Add US1 (T003–T005) → 3 stat cards visible → **MVP!**
3. Add US2 (T006–T007) → streak cards appear → motivational value
4. Add US3 (T008–T009) → period summaries appear → short-term tracking
5. Add US4 (T010–T011) → loading polish → professional feel
6. Polish (T012–T014) → verified and ready for merge

---

## Notes

- No new npm dependencies required — uses existing `date-fns`, `lucide-react`, `prisma`
- No database migrations — all stats derived from existing `FastingSession` model
- No test tasks — no test framework is currently configured
- The existing `getStats()` already computes `totalFasts`, `avgHours`, `longestFast`, `goalsMet`, `totalHours` — US1 leverages these existing calculations
- `StatsCards` is a client component (`"use client"`) because it receives props from a client parent (`FastingTimer`)
- All stat values use design tokens — no ad-hoc colors or spacing
