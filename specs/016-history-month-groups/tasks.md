# Tasks: History Month Groups

**Input**: Design documents from `/specs/016-history-month-groups/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, quickstart.md

**Tests**: Not requested — no test tasks included.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Foundational (Blocking Prerequisites)

**Purpose**: Create the grouping utility and MonthGroup component that all user stories depend on

- [x] T001 [P] Create `MonthGroup` component shell in `src/components/MonthGroup.tsx`. Accepts props: `monthKey: string`, `sessions: CompletedSession[]`, `isExpanded: boolean`, `onToggle: () => void`. Renders a full-width tappable header button (min-h-11 for 44px touch target) with locale-formatted month label (e.g., "March 2026") using `new Date(monthKey + "-01").toLocaleDateString(undefined, { month: "long", year: "numeric" })`. Renders children session cards below the header. No collapse logic yet — always show sessions.

- [x] T002 [P] Add month grouping utility function in `src/components/HistoryList.tsx`. Create a `groupByMonth` function that takes `CompletedSession[]` and returns `[string, CompletedSession[]][]` — an array of `[monthKey, sessions]` pairs. Extract `monthKey` as `YYYY-MM` from each session's `startedAt`. Preserve encounter order (reverse chronological). Wrap usage in `useMemo` depending on `sessions`.

**Checkpoint**: MonthGroup component renders with a header and session cards; grouping function correctly buckets sessions by month.

---

## Phase 2: User Story 1 — Grouped by Month (Priority: P1)

**Goal**: Display sessions organized under month headers instead of a flat list.

**Independent Test**: Open Log tab with sessions in multiple months. Sessions appear under labeled month headers in reverse chronological order. Infinite scroll still loads and merges sessions correctly.

### Implementation for User Story 1

- [x] T003 [US1] Integrate `MonthGroup` into `HistoryList.tsx` render output. Replace the flat `sessions.map(...)` with grouped rendering: call `groupByMonth(sessions)` via `useMemo`, then map over groups rendering `<MonthGroup>` for each. Pass each group's sessions to `MonthGroup` which renders `SessionCard` components. Keep all sessions expanded (no collapse yet). Preserve the existing `motion-safe:animate-slide-up` animation on session cards. Ensure the infinite scroll sentinel, loading indicator, and error retry button remain at the bottom after all month groups.

- [x] T004 [US1] Style the month header in `src/components/MonthGroup.tsx`. Use design tokens: `text-sm font-semibold text-[--color-text-muted] uppercase tracking-wider`. Add `py-3 px-1` spacing. The header should visually separate from session cards above/below. Follow existing card spacing pattern (`space-y-3` between cards within a group, `mt-6` between month groups).

**Checkpoint**: Month headers appear above their respective session groups. Infinite scroll loads new sessions into correct groups or creates new groups. Sessions within groups maintain existing order.

---

## Phase 3: User Story 2 — Collapse and Expand (Priority: P2)

**Goal**: Make month sections collapsible. Current month expanded by default, others collapsed with session counts.

**Independent Test**: Open Log tab with 3+ months. Current month expanded, others collapsed showing "(N sessions)". Tap collapsed header → expands. Tap expanded header → collapses.

### Implementation for User Story 2

- [x] T005 [US2] Add expand/collapse state to `src/components/HistoryList.tsx`. Create `expandedMonths` state as `Set<string>`. After grouping with `useMemo`, derive initial expanded state: when `monthGroups` first populates (on initial load), set `expandedMonths` to contain only the first (most recent) month key. Pass `isExpanded` and `onToggle` callback to each `MonthGroup`. The `onToggle` callback adds or removes the month key from the set.

- [x] T006 [US2] Implement collapse behavior in `src/components/MonthGroup.tsx`. When `isExpanded` is false, hide the session cards. Use CSS `grid-template-rows` transition: wrap sessions in a `div` with `display: grid`, `grid-template-rows: 1fr` when expanded and `grid-template-rows: 0fr` when collapsed, with `transition: grid-template-rows 200ms ease-out`. Inner wrapper gets `overflow: hidden` and `min-height: 0`. Use `motion-safe:` prefix on the transition. When collapsed, show session count in the header: "(N sessions)" or "(1 session)" in muted text.

**Checkpoint**: Current month auto-expands on load. Other months show collapsed with session count. Tapping toggles expand/collapse with smooth animation (or instant with reduced motion).

---

## Phase 4: User Story 3 — Chevron Indicator (Priority: P3)

**Goal**: Add a chevron arrow to month headers that rotates when toggling expand/collapse.

**Independent Test**: Collapsed months show right-pointing chevron. Expanded months show down-pointing chevron. Tapping smoothly rotates the chevron.

### Implementation for User Story 3

- [x] T007 [US3] Add chevron indicator to `src/components/MonthGroup.tsx`. Import `ChevronRight` from `lucide-react` (already used in `SessionCard.tsx`). Render the chevron on the right side of the header button. Apply `transition-transform duration-200` and `rotate-90` when `isExpanded`, `rotate-0` when collapsed. Use `motion-safe:` prefix on the transition. Chevron color: `text-slate-400 dark:text-slate-600` to match existing `SessionCard` chevron styling.

**Checkpoint**: Chevron rotates smoothly between right (collapsed) and down (expanded) states.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Final verification and edge case handling

- [x] T008 Verify edge cases in `src/components/HistoryList.tsx` and `src/components/MonthGroup.tsx`: (1) Single month — shows one header, expanded. (2) Session deletion removing last session in a month — month group disappears from rendered output. (3) Empty state — "No fasting sessions yet" displays, no month headers. (4) 375px viewport — month headers fit without overflow or wrapping. (5) Dark mode — header text and chevron colors correct in both themes.
- [x] T009 Run quickstart.md validation: walk through all test scenarios from `specs/016-history-month-groups/quickstart.md` and confirm each passes.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 1)**: No dependencies — start immediately. T001 and T002 are parallel (different files).
- **User Story 1 (Phase 2)**: Depends on T001 and T002 (uses MonthGroup component and grouping function)
- **User Story 2 (Phase 3)**: Depends on Phase 2 (adds collapse to existing grouped rendering)
- **User Story 3 (Phase 4)**: Depends on Phase 3 (adds chevron to existing collapsible headers)
- **Polish (Phase 5)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (P1)**: Requires foundational T001 + T002. Core feature — must complete first.
- **US2 (P2)**: Requires US1 complete (collapse logic on top of grouped rendering).
- **US3 (P3)**: Requires US2 complete (chevron on top of collapsible headers).

### Within Each Phase

- T001 and T002 are parallel (different files)
- T003 and T004 are sequential (T003 integrates, T004 styles)
- T005 and T006 are sequential (T005 adds state, T006 uses it)
- T008 and T009 are sequential (T008 fixes, T009 validates)

### Parallel Opportunities

- T001 and T002 can run in parallel (new file vs modifying existing file)
- Overall this is a linear feature with sequential user story dependencies — limited parallelism

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Foundational (T001, T002)
2. Complete Phase 2: User Story 1 (T003, T004)
3. **STOP and VALIDATE**: Sessions grouped under month headers, infinite scroll works
4. Deploy if ready — grouping alone adds significant navigation value

### Incremental Delivery

1. T001 + T002 → Foundation ready
2. T003 + T004 → Month groups visible (MVP!)
3. T005 + T006 → Collapse/expand working
4. T007 → Chevron indicator polished
5. T008 + T009 → Edge cases verified

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- US1 → US2 → US3 are sequential dependencies (each builds on the previous)
- No API or database changes needed — entirely client-side
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
