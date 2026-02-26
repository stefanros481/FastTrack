# Tasks: Fasting Goal

**Input**: Design documents from `/specs/005-fasting-goal/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, quickstart.md

**Tests**: Not explicitly requested — no test tasks included.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Exact file paths included in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Shared validation schema and server actions needed by multiple user stories

- [x] T001 Add goalMinutes Zod validation schema in `src/lib/validators.ts` — export `goalMinutesSchema` (z.number().int().min(60).max(4320)) and `customGoalHoursSchema` (z.number().min(1).max(72).positive())
- [x] T002 [P] Add `getDefaultGoal()` and `updateDefaultGoal(goalMinutes: number | null)` server actions in `src/app/actions/settings.ts` — follow existing `getTheme`/`updateTheme` pattern, validate with goalMinutesSchema, read/write `UserSettings.defaultGoalMinutes`
- [x] T003 [P] Update `src/app/page.tsx` SSR to call `getDefaultGoal()` and pass `defaultGoalMinutes` as prop to `FastingTimer`

**Checkpoint**: Shared validation and server-side data flow ready

---

## Phase 2: User Story 1 — Set a Fasting Goal (Priority: P1) 🎯 MVP

**Goal**: Replace the protocol card grid with goal pills (12h, 16h, 18h, 20h, 24h) + custom input. Pre-fill from default goal. Pass goalMinutes to startFast.

**Independent Test**: Start a new fast, select a goal pill or enter a custom duration, confirm the fast starts with the chosen goalMinutes. Verify default goal pre-fills if saved.

### Implementation for User Story 1

- [x] T004 [US1] Create `src/components/GoalSelector.tsx` — goal pill buttons (12h, 16h, 18h, 20h, 24h) with protocol subtitles on matching pills (16h→Intermittent, 18h→Advanced, 20h→Warrior, 24h→OMAD). Horizontal scrollable row with `overflow-x-auto`. Selected pill: `bg-[--color-primary] text-white rounded-full`; unselected: `bg-[--color-primary-light] text-[--color-primary-dark] rounded-full`. Include "Custom" pill that toggles inline numeric input (hours). Props: `value: number | null`, `onChange: (minutes: number | null) => void`, `defaultGoalMinutes: number | null`. Pre-select matching pill or fill custom input from defaultGoalMinutes. Section label: `text-xl font-semibold text-[--color-text]`. Min touch target 44×44px.
- [x] T005 [US1] Integrate GoalSelector into `src/components/FastingTimer.tsx` — replace `FASTING_PROTOCOLS` card grid and `selectedProtocol` state with GoalSelector. Add `goalMinutes` state. Pass `defaultGoalMinutes` prop (from page.tsx). On "Start Fast" button, call `startFast(goalMinutes)` with selected goal. Update Props interface to accept `defaultGoalMinutes: number | null`.
- [x] T006 [US1] Build verification — run `bun run build` to confirm no type errors or build failures

**Checkpoint**: User can select a goal and start a fast with goalMinutes saved. MVP complete.

---

## Phase 3: User Story 2 — View Goal Progress Ring (Priority: P2)

**Goal**: Display SVG circular progress ring replacing fill animation when fasting with a goal. Show HH:MM:SS inside ring, percentage + "time to go" below. Celebration animation on goal completion.

**Independent Test**: Start a fast with a goal, observe ring filling, percentage updating. At 100%, ring turns green with celebration animation. Without a goal, existing fill animation shows.

### Implementation for User Story 2

- [x] T007 [US2] Create `src/components/ProgressRing.tsx` — SVG `<circle>` ring with `stroke-dasharray`/`stroke-dashoffset`. Props: `progress: number` (0–1), `goalReached: boolean`, `elapsedFormatted: string` (HH:MM:SS), `percentText: string`, `remainingText: string`. Ring stroke: `var(--color-primary)` on `var(--color-primary-light)` track. When `goalReached`: stroke → `var(--color-success)`, show checkmark icon with `motion-safe:animate-bounce-in` (keyframe: scale 0→1.1→1 over 0.5s). CSS `transition: stroke-dashoffset 1s ease`. Responsive sizing. Timer inside ring: `text-3xl font-bold text-[--color-text]` (monospace). Secondary labels: `text-sm text-[--color-text-muted]`. Add `animate-bounce-in` keyframe to `src/app/globals.css`.
- [x] T008 [US2] Integrate ProgressRing into `src/components/FastingTimer.tsx` — when active fast has `goalMinutes`, render ProgressRing instead of the existing fill-animation timer card. Compute `progress = Math.min(elapsedMs / (goalMinutes * 60 * 1000), 1)`, `goalReached = progress >= 1`, format remaining time as "Xh Ym to go" or "Goal reached!". When no goal, keep existing timer card with fill animation unchanged.
- [x] T009 [US2] Build verification — run `bun run build` to confirm no errors

**Checkpoint**: Progress ring displays during goal-based fasts, celebration fires on completion.

---

## Phase 4: User Story 3 — Goal Reached Notification (Priority: P3)

**Goal**: Fire browser notification and/or in-app toast when goal is reached. Single notification per session.

**Independent Test**: Start a fast with a short goal, wait for goal time, verify browser notification fires (if permitted) and/or in-app toast appears with correct message.

### Implementation for User Story 3

- [x] T010 [US3] Create `src/components/Toast.tsx` — fixed-position toast at bottom of viewport. Props: `message: string`, `onDismiss: () => void`. Style: `bg-[--color-success]` background, white text, `rounded-xl`, `p-4`. Entrance: `motion-safe:animate-slide-up` (keyframe: translateY(100%)→0). Auto-dismiss after 5s via `setTimeout`. Tap to dismiss via `onClick`. Add `animate-slide-up` keyframe to `src/app/globals.css`.
- [x] T011 [US3] Create `src/hooks/useGoalNotification.ts` — hook accepting `goalMinutes: number | null`, `elapsedMs: number`, `isActive: boolean`. Uses React ref to track "notified" state (prevents duplicates). When `elapsedMs >= goalMinutes * 60 * 1000` and not yet notified: (1) request `Notification.permission` if not yet decided, (2) fire `new Notification("You've reached your Xh fasting goal!")` if granted, (3) return `{ showToast: boolean, toastMessage: string }` for in-app fallback. Reset ref when `isActive` becomes false (new session).
- [x] T012 [US3] Integrate Toast and useGoalNotification into `src/components/FastingTimer.tsx` — call `useGoalNotification` with active fast's goalMinutes and elapsed time. Render `<Toast>` when `showToast` is true with dismiss handler.
- [x] T013 [US3] Build verification — run `bun run build` to confirm no errors

**Checkpoint**: Notifications fire correctly on goal completion with no duplicates.

---

## Phase 5: User Story 4 — Default Goal in Settings (Priority: P4)

**Goal**: Add "Default fasting goal" UI to settings page. Uses same pill selector pattern. Persists via server action.

**Independent Test**: Go to Settings, set a default goal, navigate to timer, start new fast — goal selector pre-fills with default. Clear default — no pre-fill.

### Implementation for User Story 4

- [x] T014 [US4] Create `src/components/DefaultGoalSetting.tsx` — client component with same pill buttons as GoalSelector (12h, 16h, 18h, 20h, 24h) plus custom input and "None" option to clear. Props: `currentDefault: number | null`. On selection change, call `updateDefaultGoal(goalMinutes)` server action. Settings row style: body text label left, selector below, `min-h-11`, `border-b border-slate-100` separator.
- [x] T015 [US4] Integrate DefaultGoalSetting into `src/app/settings/page.tsx` — fetch current default goal server-side via `getDefaultGoal()`, render `<DefaultGoalSetting currentDefault={defaultGoal} />` in the settings list.
- [x] T016 [US4] Build verification — run `bun run build` to confirm no errors

**Checkpoint**: Default goal fully manageable from settings, pre-fills on timer page.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final verification and cleanup

- [x] T017 Full build verification — run `bun run build` and verify zero errors
- [x] T018 Run quickstart.md smoke test scenarios manually — verify all 6 smoke test flows from quickstart.md pass

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
  - T001 must complete before T002 (validators used in settings actions)
  - T002 and T003 can run in parallel [P] after T001
- **US1 (Phase 2)**: Depends on Phase 1 completion
  - T004 → T005 → T006 (sequential: component → integration → build check)
- **US2 (Phase 3)**: Depends on Phase 2 (needs goalMinutes in FastingTimer)
  - T007 → T008 → T009 (sequential: component → integration → build check)
- **US3 (Phase 4)**: Depends on Phase 3 (notification makes sense after ring shows goal reached)
  - T010 and T011 can run in parallel [P] (different files)
  - T012 depends on T010 + T011 → T013
- **US4 (Phase 5)**: Depends on Phase 1 only (uses getDefaultGoal/updateDefaultGoal from T002)
  - Can technically run in parallel with US1–US3 but shares FastingTimer.tsx integration
  - T014 → T015 → T016 (sequential)
- **Polish (Phase 6)**: Depends on all user stories complete

### Parallel Opportunities

- **Phase 1**: T002 + T003 can run in parallel after T001
- **Phase 4**: T010 + T011 can run in parallel (Toast.tsx + useGoalNotification.ts)
- **Cross-phase**: US4 (Phase 5) could overlap with US2/US3 if careful about FastingTimer.tsx merge conflicts — sequential recommended for solo developer

### Within Each User Story

- Component creation before integration into FastingTimer
- Build verification after each integration

---

## Parallel Example: Phase 1

```bash
# After T001 (validators) completes:
Task: "T002 — Add getDefaultGoal/updateDefaultGoal server actions in src/app/actions/settings.ts"
Task: "T003 — Update src/app/page.tsx SSR to pass defaultGoalMinutes prop"
```

## Parallel Example: Phase 4 (US3)

```bash
# Both can start simultaneously:
Task: "T010 — Create Toast component in src/components/Toast.tsx"
Task: "T011 — Create useGoalNotification hook in src/hooks/useGoalNotification.ts"
# Then sequentially:
Task: "T012 — Integrate both into FastingTimer.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001–T003)
2. Complete Phase 2: User Story 1 (T004–T006)
3. **STOP and VALIDATE**: Start a fast with a goal, verify goalMinutes saved
4. Deploy if ready — core goal-setting works

### Incremental Delivery

1. Setup → Foundation ready
2. Add US1 (goal selector) → Test → Deploy (MVP!)
3. Add US2 (progress ring) → Test → Deploy
4. Add US3 (notifications) → Test → Deploy
5. Add US4 (default goal settings) → Test → Deploy
6. Each story adds value without breaking previous stories

---

## Notes

- No database migration needed — `goalMinutes` and `defaultGoalMinutes` already exist in schema
- FastingTimer.tsx is the main integration point for US1, US2, US3 — sequential implementation recommended
- US4 (settings) is largely independent but shares the pill selector pattern with US1
- All animations use `motion-safe:` prefix except error shake
- Custom goal input validates 1–72 hours; converted to minutes (×60) before saving
