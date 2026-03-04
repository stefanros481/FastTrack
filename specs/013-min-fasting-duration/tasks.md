# Tasks: Minimum Fasting Duration Enforcement

**Input**: Design documents from `/specs/013-min-fasting-duration/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: No automated tests requested. Manual testing via quickstart.md scenarios.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Define shared constants used across all user stories

- [x] T001 Add `MIN_FAST_MINUTES` (720) and `MIN_FAST_MS` (43200000) constants to `src/lib/validators.ts`

**Checkpoint**: Constants available for use in all subsequent phases

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Server-side validation that MUST be complete before UI changes

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T002 Add minimum 12-hour duration `.refine()` check to `sessionEditSchema` in `src/lib/validators.ts` — validate `endedAt - startedAt >= MIN_FAST_MS`, error message "Session must be at least 12 hours", path `["endedAt"]`
- [x] T003 Add 12-hour server guard to `stopFast()` in `src/app/actions/fasting.ts` — (1) Define `StopFastResult` type: `{ success: true; session: FastingSession } | { success: false; error: string }`. (2) Fetch session's `startedAt` before updating. (3) Check `now - startedAt >= MIN_FAST_MS`; if under 12h return `{ success: false, error: "Session must be at least 12 hours" }`. (4) On success return `{ success: true, session }`. (5) On P2025 (already ended) return `{ success: true, session: null }`. (6) Update `handleEndSessionAccessible` in `FastingTimer.tsx` to handle the new return type (same pattern as T007).

**Checkpoint**: Foundation ready — server rejects sub-12h session saves and edits. User story implementation can now begin.

---

## Phase 3: User Story 1 - End or Cancel a Fast via Long-Press (Priority: P1) 🎯 MVP

**Goal**: The existing long-press gesture conditionally cancels (deletes) or ends (saves) a session based on whether 12 hours have elapsed.

**Independent Test**: Start a fast → long-press immediately → verify ring says "Cancel" and session is deleted. Start another fast → edit start time to 13h ago → long-press → verify ring says "End" and session is saved to history.

### Implementation for User Story 1

- [x] T004 [P] [US1] Add `isBelowMinimum` boolean prop to `ProgressRing` component in `src/components/ProgressRing.tsx` — when `true`: hint text "Hold ring to cancel", active press text "Hold to cancel...", completion text "Session cancelled"; when `false`: keep existing text ("Hold ring to end", "Hold to end...", "Session ended")
- [x] T005 [P] [US1] Compute `isBelowMinimum` in `src/components/FastingTimer.tsx` — import `MIN_FAST_MINUTES` from `src/lib/validators.ts`, derive from `elapsedSeconds < MIN_FAST_MINUTES * 60`, pass as prop to `ProgressRing`. Also satisfies FR-010 (real-time label transition) since `elapsedSeconds` updates every second.
- [x] T006 [US1] Modify `handleLongPressComplete` in `src/components/FastingTimer.tsx` — if `elapsedSeconds < MIN_FAST_MINUTES * 60`, call `deleteSession(currentFast.id)` instead of `stopFast(currentFast.id)`. Import `deleteSession` from `src/app/actions/fasting.ts`. Handle the `DeleteSessionResult` return type (check `result.success`). On success: `setCurrentFast(null)`. On failure: show error and reset long-press.
- [x] T007 [US1] Handle the updated `StopFastResult` return type in `src/components/FastingTimer.tsx` — update `handleLongPressComplete` (12h+ path) to check `result.success`: if `false`, display `result.error` and call `longPressState.reset()`; if `true`, call `setCurrentFast(null)`. This is the server-side safety net in case elapsed time drifts between client and server.

**Checkpoint**: User Story 1 fully functional — long-press cancels sub-12h sessions and ends 12h+ sessions.

---

## Phase 4: User Story 2 - Prevent Editing Below 12 Hours (Priority: P2)

**Goal**: Session edits that would result in a sub-12-hour duration are rejected with an error message.

**Independent Test**: Open a completed session → edit end time to create < 12h duration → verify error message "Session must be at least 12 hours" appears below end time picker and save button is disabled.

### Implementation for User Story 2

- [x] T008 [US2] Verify `SessionDetailModal` in `src/components/SessionDetailModal.tsx` automatically picks up the new `.refine()` from `sessionEditSchema` (T002) — no code changes expected since the modal already runs `sessionEditSchema.safeParse()` in its `useEffect` and displays errors per-field. Manually test the flow: edit a session to < 12h → confirm error appears under end time picker → confirm save button is disabled.

**Checkpoint**: User Story 2 functional — session edits validated against 12h minimum both client-side and server-side.

---

## Phase 5: User Story 3 - Visual Indicator of Minimum Threshold (Priority: P3)

**Goal**: The ring label ("Cancel" vs "End") serves as the primary visual indicator. Additional visual cues reinforce the 12h threshold state.

**Independent Test**: Start a fast → observe ring label says "Cancel" → edit start time to ~11h 59m ago → watch label transition to "End" as 12h mark is crossed.

### Implementation for User Story 3

- [x] T009 [US3] Verify real-time label transition works in `src/components/FastingTimer.tsx` — the `isBelowMinimum` boolean (from T005) already re-evaluates every second as `elapsedSeconds` increments. Confirm the `ProgressRing` label transitions from "Cancel" to "End" smoothly when crossing the 12h mark. No code changes expected — React re-render handles this automatically.

**Checkpoint**: All user stories functional. Label transition works in real time.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final verification and cleanup

- [x] T010 Verify existing sessions shorter than 12 hours remain visible in history — query history page and confirm grandfathered sessions are unaffected
- [x] T011 Run quickstart.md validation scenarios from `specs/013-min-fasting-duration/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — defines constants
- **Foundational (Phase 2)**: Depends on Phase 1 — adds server-side validation
- **User Story 1 (Phase 3)**: Depends on Phase 2 — uses server guard and calls deleteSession/stopFast
- **User Story 2 (Phase 4)**: Depends on Phase 2 only — leverages Zod schema from T002
- **User Story 3 (Phase 5)**: Depends on Phase 3 — verifies behavior from T005
- **Polish (Phase 6)**: Depends on all user stories complete

### User Story Dependencies

- **User Story 1 (P1)**: Depends on Foundational (Phase 2). No dependencies on other stories.
- **User Story 2 (P2)**: Depends on Foundational (Phase 2). No dependencies on other stories. Can run in parallel with US1.
- **User Story 3 (P3)**: Depends on US1 (uses `isBelowMinimum` prop from T005). Must run after US1.

### Within Each User Story

- T004 and T005 can run in parallel (different files)
- T006 depends on T004 and T005 (uses both the prop and the elapsed check)
- T007 depends on T003 (handles updated return type)

### Parallel Opportunities

- T004 and T005 can run in parallel (ProgressRing.tsx and FastingTimer.tsx)
- T002 and T003 can run in parallel (validators.ts and fasting.ts)
- US1 and US2 can start in parallel after Phase 2 (US2 is just verification of T002)

---

## Parallel Example: Foundational Phase

```bash
# These two tasks modify different files and can run in parallel:
Task T002: "Add min duration .refine() to sessionEditSchema in src/lib/validators.ts"
Task T003: "Add 12h server guard to stopFast() in src/app/actions/fasting.ts"
```

## Parallel Example: User Story 1

```bash
# These two tasks modify different files and can run in parallel:
Task T004: "Add isBelowMinimum prop to ProgressRing in src/components/ProgressRing.tsx"
Task T005: "Compute isBelowMinimum in src/components/FastingTimer.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001)
2. Complete Phase 2: Foundational (T002, T003)
3. Complete Phase 3: User Story 1 (T004–T007)
4. **STOP and VALIDATE**: Test cancel and end paths independently
5. Deploy via Vercel preview

### Incremental Delivery

1. Setup + Foundational → Server-side protection active
2. Add User Story 1 → Cancel/End behavior working → Deploy (MVP!)
3. Add User Story 2 → Verify session edits protected → Deploy
4. Add User Story 3 → Verify real-time transition → Deploy
5. Polish → Final verification → Deploy to production

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- T008 and T009 are verification tasks — likely no code changes needed since T002 and T005 handle the logic
- Only 4 files are modified: `validators.ts`, `fasting.ts`, `FastingTimer.tsx`, `ProgressRing.tsx`
- No database migrations, no new files, no new dependencies
- Commit after each phase completion
