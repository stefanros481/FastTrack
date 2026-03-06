# Tasks: Achievements & Badges

**Input**: Design documents from `/specs/019-achievements/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Not requested — manual acceptance testing per project convention.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: Create shared types and badge definitions that all user stories depend on

- [X] T001 [P] Define badge TypeScript types (BadgeCategory, Badge, EarnedBadge, BadgeProgress, ComputedBadgeState) in `src/types/badges.ts`
- [X] T002 Define all 19 badge constants with id, category, threshold, label, description, and Lucide icon mapping in `src/lib/badges.ts` per data-model.md badge definitions table

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Badge computation server action — MUST be complete before any UI story can render badge data

- [X] T003 Implement badge computation logic in `src/lib/badges.ts`: streak (best streak from sorted unique dates), volume (sessions.length), duration (single-session 18h/24h cap + cumulative 100h), consistency (perfect week/month via eachDayOfInterval), goals (goalMinutes met count). Import from `src/types/badges.ts`. Use date-fns: startOfDay, differenceInCalendarDays, startOfISOWeek, endOfISOWeek, startOfMonth, endOfMonth, eachDayOfInterval, min. Export a pure function `computeBadges(sessions)` that takes session array and returns `ComputedBadgeState`.
- [X] T004 Create `getBadges()` server action in `src/app/actions/badges.ts` following `getStats()` pattern: call `getUserId()`, fetch completed sessions via Prisma (where userId + endedAt not null, select startedAt/endedAt/goalMinutes, orderBy endedAt asc), call `computeBadges()`, return `ComputedBadgeState | null` (null if no sessions)

**Checkpoint**: `getBadges()` server action returns correct badge state — can verify via temporary test call

---

## Phase 3: User Story 3 - Community Tab & Navigation (Priority: P1) 🎯 MVP

**Goal**: Add Community tab to bottom navigation for gamification-enabled users, move Settings to header gear icon

**Independent Test**: Tap Community tab in bottom nav, see Community view load. Tap gear icon in header to reach Settings. Toggle gamification off — Community tab disappears, original nav restored.

### Implementation for User Story 3

- [X] T005 [US3] Add `"community"` to the view union type in `src/components/FastingTimer.tsx` (change `"timer" | "dashboard" | "history"` to `"timer" | "dashboard" | "history" | "community"`)
- [X] T006 [US3] Update bottom navigation in `src/components/FastingTimer.tsx` to conditionally render: when `gamificationEnabled && gamificationAchievements` → show Timer, Insights, Community (Users icon), Log tabs; when disabled → show original Timer, Insights, Log, Settings tabs. Community button calls `setView("community")`. All tabs use `min-h-11 min-w-11` touch targets.
- [X] T007 [US3] Add Settings gear icon (`Settings` from lucide-react, wrapped in `<Link href="/settings">`) to header right side in `src/components/FastingTimer.tsx`, rendered only when gamification is enabled. Use `min-h-11 min-w-11` touch target, `text-slate-400` muted color.
- [X] T008 [US3] Create placeholder `CommunityView` client component in `src/components/CommunityView.tsx` with "use client" directive, showing "Achievements" heading. Add `{view === "community" && <CommunityView />}` render branch in `src/components/FastingTimer.tsx` main content area.
- [X] T009 [US3] Ensure `gamificationAchievements` boolean is passed from `src/app/page.tsx` to `FastingTimer` alongside existing `gamificationEnabled` prop. Verify the gamification settings fetch in page.tsx includes the achievements field.

**Checkpoint**: Community tab appears/disappears based on gamification setting. Gear icon navigates to Settings. Original nav preserved when gamification disabled.

---

## Phase 4: User Story 1 - View My Achievements (Priority: P1)

**Goal**: Display all 19 badges in a grid on the Community tab, organized by category, with earned/locked visual states

**Independent Test**: Navigate to Community tab with completed sessions — see badges grid with earned badges highlighted and locked badges dimmed. With zero sessions — all badges locked with unlock criteria visible.

### Implementation for User Story 1

- [X] T010 [US1] Implement `AchievementsGrid` client component in `src/components/AchievementsGrid.tsx`: receives `ComputedBadgeState` as prop, renders badges grouped by category (Streak, Volume, Duration, Consistency, Goals) with category heading rows. 3-column grid layout. Earned badges: full color icon with category color from research.md (Flame=amber, Hash=indigo, Clock=green, CalendarCheck=indigo, Target=green). Locked badges: `--color-text-muted` with reduced opacity. Each badge cell shows icon + label. Min 44x44px touch targets. Use design system tokens (`--color-*`).
- [X] T011 [US1] Update `CommunityView` in `src/components/CommunityView.tsx` to lazy-fetch badge data: call `getBadges()` server action on mount via `useEffect` + `startTransition`, store in state (`ComputedBadgeState | null`), show loading skeleton while fetching. Render section header "Achievements" with earned count (e.g., "5/19"). Render `<AchievementsGrid>` when data is loaded. Handle null state (no sessions) with empty state message.
- [X] T012 [US1] Handle gamification-disabled state: ensure `CommunityView` is only rendered when `view === "community"` which is only reachable when gamification is enabled (enforced by nav in T006). Add empty state for zero sessions (all badges locked with unlock criteria visible per acceptance scenario 2).

**Checkpoint**: Badges grid renders correctly with earned/locked states. Empty state shows all badges locked. Gamification-disabled users never see the grid.

---

## Phase 5: User Story 2 - Unlock Badge Celebration (Priority: P2)

**Goal**: Show celebratory overlay when user views newly earned badges for the first time, with sequential display for multiple badges

**Independent Test**: Clear localStorage (`localStorage.removeItem("fasttrack:celebrations-seen")`), navigate to Community tab with earned badges — celebration overlay appears with bounce-in animation. Dismiss all, return to tab — no celebration appears.

### Implementation for User Story 2

- [X] T013 [US2] Create `BadgeCelebration` client component in `src/components/BadgeCelebration.tsx`: receives `newBadgeIds: string[]` and `onAllSeen: () => void`. Full-screen overlay with `bg-black/50` backdrop (z-index above nav). Renders one badge at a time from queue. Shows badge icon (large, category color) + label + description with `motion-safe:animate-bounce-in`. Queue indicator ("1 of 3") when multiple badges. Button: "Next" or "Done" (last badge), `rounded-full min-h-11 bg-[--color-primary]`. Backdrop tap does NOT dismiss. On each dismiss: write badge ID + timestamp to localStorage immediately via `fasttrack:celebrations-seen` key. When all dismissed, call `onAllSeen`.
- [X] T014 [US2] Integrate celebration into `CommunityView` in `src/components/CommunityView.tsx`: after badge data loads, read `fasttrack:celebrations-seen` from localStorage, compute `newBadges = earned.filter(id => !(id in seenMap))`. If `newBadges.length > 0`, render `<BadgeCelebration newBadgeIds={newBadges} onAllSeen={...} />`. After all celebrations seen, update local state to hide overlay.

**Checkpoint**: Celebration appears for newly earned badges. Each badge shown once. Multiple badges shown sequentially with queue indicator. Celebrations persist across tab switches but not across localStorage clears.

---

## Phase 6: User Story 4 - Badge Progress Indicators (Priority: P3)

**Goal**: Show progress toward next unearned badge in each category (e.g., "7/10")

**Independent Test**: View a locked badge — see progress text like "7/10" below the badge icon.

### Implementation for User Story 4

- [X] T015 [US4] Update `AchievementsGrid` in `src/components/AchievementsGrid.tsx` to display progress indicators: for each category, find the matching `BadgeProgress` entry from `ComputedBadgeState.progress`. Show progress text (e.g., "7/10") below the next locked badge in each category. When all badges in a category are earned, show no progress indicator. Use `text-sm text-[--color-text-muted]` styling.

**Checkpoint**: Progress text appears on the next locked badge per category. All-earned categories show no progress. Zero-session users see "0/N" progress.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and edge case handling

- [X] T016 Verify 375px mobile viewport: test badge grid fits without horizontal scroll, all touch targets meet 44x44px, nav tabs properly sized. Fix any overflow or sizing issues in `src/components/AchievementsGrid.tsx` and `src/components/FastingTimer.tsx`
- [X] T017 Verify dark mode: ensure all badge colors, overlays, and navigation work correctly in dark theme. Check that earned/locked badge contrast is sufficient in both light and dark modes. Fix any color issues using design system tokens.
- [X] T018 Run quickstart.md validation: verify all acceptance scenarios from spec.md work end-to-end (gamification on/off toggle, zero sessions state, celebration sequential display, progress indicators, gear icon navigation)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 (types + badge definitions)
- **US3 Navigation (Phase 3)**: Depends on Phase 1 (types for future integration). Does not need Phase 2 badge computation — only needs gamification settings already fetched in page.tsx
- **US1 View Achievements (Phase 4)**: Depends on Phase 2 (needs getBadges() server action) + Phase 3 (needs Community tab to exist)
- **US2 Celebrations (Phase 5)**: Depends on Phase 4 (needs AchievementsGrid + CommunityView with badge data)
- **US4 Progress (Phase 6)**: Depends on Phase 4 (needs AchievementsGrid component to add progress to)
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **US3 (P1 — Navigation)**: Can start after Foundational — no dependency on other stories. Must complete BEFORE US1 since US1 renders inside the Community tab.
- **US1 (P1 — View Achievements)**: Depends on US3 (Community tab must exist). Core badge display.
- **US2 (P2 — Celebrations)**: Depends on US1 (needs badge data + CommunityView integration point)
- **US4 (P3 — Progress)**: Depends on US1 (needs AchievementsGrid to add progress indicators to). Can run in parallel with US2.

### Within Each User Story

- Core logic before UI integration
- Component creation before integration into parent
- Story complete before moving to next priority

### Parallel Opportunities

- T001 and T002 can run in parallel (different files)
- US2 (Phase 5) and US4 (Phase 6) can run in parallel after US1 completes — they modify different aspects of the UI
- T016 and T017 can run in parallel (different concerns)

---

## Parallel Example: Setup Phase

```bash
# Launch both setup tasks together:
Task: "Define badge TypeScript types in src/types/badges.ts"
Task: "Define all 19 badge constants in src/lib/badges.ts"
```

## Parallel Example: Post-US1 Phase

```bash
# After US1 completes, launch US2 and US4 in parallel:
Task: "Create BadgeCelebration component in src/components/BadgeCelebration.tsx"
Task: "Update AchievementsGrid with progress indicators in src/components/AchievementsGrid.tsx"
```

---

## Implementation Strategy

### MVP First (US3 + US1 Only)

1. Complete Phase 1: Setup (types + constants)
2. Complete Phase 2: Foundational (computation + server action)
3. Complete Phase 3: US3 Navigation (Community tab + gear icon)
4. Complete Phase 4: US1 View Achievements (badge grid)
5. **STOP and VALIDATE**: Test badge grid, navigation, gamification toggle
6. Deploy/demo if ready — core badge viewing is functional

### Incremental Delivery

1. Setup + Foundational → Badge computation ready
2. Add US3 Navigation → Community tab exists → Deploy/Demo
3. Add US1 View Achievements → Badge grid live → Deploy/Demo (MVP!)
4. Add US2 Celebrations → Emotional payoff added → Deploy/Demo
5. Add US4 Progress → Engagement deepened → Deploy/Demo
6. Polish → Production-ready

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- No database migrations needed — all badge state is computed
- US3 (Navigation) is ordered before US1 (View) because the Community tab must exist before badges can be rendered in it
- US2 and US4 are independent of each other and can be parallelized after US1
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
