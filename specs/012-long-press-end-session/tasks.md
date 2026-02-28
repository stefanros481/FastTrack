# Tasks: Long-Press Progress Ring to End Session

**Input**: Design documents from `/specs/012-long-press-end-session/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md

**Tests**: Not requested — no automated test tasks included.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create the long-press gesture hook that all user stories depend on

- [x] T001 Create `useLongPress` hook in `src/hooks/useLongPress.ts` — implement Pointer Events API (`onPointerDown`, `onPointerUp`, `onPointerLeave`, `onPointerCancel`) with `requestAnimationFrame` loop using `performance.now()` for wall-clock timing. Accept `duration` (default 5000ms) and `onComplete` callback. Return `{ progress: number (0-1), isPressed: boolean, handlers: PointerEventHandlers }`. Reset progress on release or pointer leave. Call `onComplete` when progress reaches 1.0. Clean up rAF on unmount. **Key acceptance criteria**: pointer leave (`onPointerLeave`) and system cancel (`onPointerCancel`) MUST reset progress to 0 and set `isPressed` to false (FR-007).

**Checkpoint**: Hook is independently testable by logging progress values.

---

## Phase 2: User Story 1 — End Fast via Long Press (Priority: P1) MVP

**Goal**: Users can end their fasting session by holding the progress ring for 5 seconds. The red confirmation circle fills during the hold and the "Hold to end..." text appears. Releasing early cancels. The "End Fast" button is removed.

**Independent Test**: Start a fast with a goal, press and hold the progress ring for 5 seconds, verify the session ends and the idle/goal-selector screen is shown. Release early and verify the session continues.

### Implementation for User Story 1

- [x] T002 [US1] Add long-press confirmation circle to `ProgressRing` in `src/components/ProgressRing.tsx` — add new props: `longPressProgress` (number 0-1), `isPressed` (boolean), `onLongPressComplete` callback, and `onEndSession` callback (for accessible fallback). Render a second SVG `<circle>` inside the existing ring with a smaller radius, red stroke color (`var(--color-error)`), and `strokeDashoffset` driven by `longPressProgress`. The confirmation circle should only be visible when `isPressed` is true or `longPressProgress > 0`.
- [x] T003 [US1] Add hold text feedback to `ProgressRing` in `src/components/ProgressRing.tsx` — when `isPressed` is true, replace the secondary labels (percent + remaining text) with "Hold to end..." text. When `longPressProgress` reaches 1.0, briefly show "Session ended" before the parent transitions the view. Keep existing labels when not pressed.
- [x] T004 [US1] Wire long-press interaction in `FastingTimer` in `src/components/FastingTimer.tsx` — import and use `useLongPress` hook with 5000ms duration and `stopFast` as the `onComplete` callback. Pass `progress`, `isPressed`, and pointer event handlers down to `ProgressRing`. Attach the pointer event handlers to the ring container `<div>`.
- [x] T005 [US1] Remove "End Fast" button and confirm flow from `FastingTimer` in `src/components/FastingTimer.tsx` — remove `confirmingEnd` state, `handleCancelEnd` function, and the entire `handleEndFast` function. Remove the conditional button block that renders "End Fast" / "Cancel" + "Confirm End" buttons (lines ~338-375). Keep the "Start Fast" button for idle state unchanged.

**Checkpoint**: User Story 1 is fully functional — long-press ends sessions for goal-based fasts. The old button is gone.

---

## Phase 3: User Story 2 — Always Show Ring for No-Goal Sessions (Priority: P1)

**Goal**: Sessions started without a goal display a progress ring (using 16h default reference) instead of the plain timer card, so the long-press gesture is always available.

**Independent Test**: Start a fast without selecting a goal. Verify a progress ring is shown (not the plain timer card). Long-press it for 5 seconds and verify the session ends.

### Implementation for User Story 2

- [x] T006 [US2] Always render `ProgressRing` for active sessions in `FastingTimer` in `src/components/FastingTimer.tsx` — replace the conditional rendering that shows a plain timer card for no-goal sessions (the `else` branch of `isFasting && currentFast?.goalMinutes ?` on lines ~280-335) with the same `ProgressRing` component. For no-goal sessions, use `targetSeconds` (already defaults to `16 * 3600`) to calculate progress. Pass the same long-press props. Move the "Started..." button to appear below the ring in both cases. Ensure the start-time editing button is preserved and unaffected by long-press.

**Checkpoint**: All active sessions (with or without goals) show a progress ring and support long-press to end.

---

## Phase 4: User Story 3 — Visual Feedback Polish (Priority: P2)

**Goal**: Smooth, polished visual feedback during the long-press interaction — smooth reset on early release, persistent discoverability hint, and clear completion state.

**Independent Test**: Press and hold the ring, then release at ~2 seconds. Verify the red circle smoothly animates back to empty (not an instant snap). Verify "Hold ring to end" hint is always visible below the ring during active sessions.

### Implementation for User Story 3

- [x] T007 [US3] Add smooth reset transition for confirmation circle in `src/components/ProgressRing.tsx` — when the user releases early (`isPressed` becomes false and `longPressProgress` > 0), the confirmation circle should animate back to empty smoothly (CSS transition on `strokeDashoffset`, e.g., `transition: stroke-dashoffset 0.3s ease-out`). During active hold, disable the transition so the fill tracks the rAF-driven progress in real time.
- [x] T008 [US3] Add persistent "Hold ring to end" discoverability hint in `src/components/ProgressRing.tsx` — add a muted text hint (`text-sm text-[--color-text-muted]`) below the ring's secondary labels that reads "Hold ring to end". This hint should always be visible during active sessions (not only during the hold). Use `motion-safe:animate-fade-in` for its entrance.

**Checkpoint**: Visual feedback is polished — smooth reset, clear discoverability, and completion indication all working.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Accessibility fallback, edge case handling, and final cleanup

- [x] T009 Add sr-only accessible "End session" button in `src/components/ProgressRing.tsx` — add a `<button className="sr-only">End session</button>` after the ring SVG in DOM order. It should be focusable via keyboard Tab and call the `onEndSession` callback (which triggers `stopFast`) directly without requiring a long press. Ensure it has an appropriate `aria-label`.
- [x] T010 Handle error feedback on session end failure in `src/components/FastingTimer.tsx` — if `stopFast` throws or fails, reset the long-press state (progress back to 0, isPressed to false) and show an error indication (e.g., use the existing Toast component to display an error message). Wrap the `stopFast` call in a try/catch within the `onComplete` callback.
- [x] T011 Prevent context menu on long press in `src/components/ProgressRing.tsx` — add `onContextMenu={(e) => e.preventDefault()}` to the ring container to prevent the browser's right-click/long-press context menu from appearing on mobile devices during the hold gesture.
- [ ] T012 Run quickstart.md manual validation — follow all steps in `specs/012-long-press-end-session/quickstart.md` to verify the complete feature works end-to-end. Additionally validate: (1) quick-tap the ring — verify nothing happens and no state changes; (2) press and drag finger off the ring — verify the hold cancels and confirmation circle resets; (3) Tab to the sr-only "End session" button and activate it — verify session ends.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **US1 (Phase 2)**: Depends on Phase 1 (useLongPress hook)
- **US2 (Phase 3)**: Depends on Phase 2 (needs ProgressRing with long-press support)
- **US3 (Phase 4)**: Depends on Phase 2 (adds polish to existing long-press interaction)
- **Polish (Phase 5)**: Depends on Phase 2 (core interaction must work first)

### User Story Dependencies

- **User Story 1 (P1)**: Depends on Setup (Phase 1). This is the MVP — core long-press interaction.
- **User Story 2 (P1)**: Depends on US1 (Phase 2). Extends ProgressRing rendering to no-goal sessions.
- **User Story 3 (P2)**: Depends on US1 (Phase 2). Adds visual polish. Can run in parallel with US2.

### Within Each User Story

- T002 and T003 can be done in sequence (same file, related changes to ProgressRing)
- T004 and T005 can be done in sequence (same file, related changes to FastingTimer)
- T002/T003 and T004/T005 touch different files and could run in parallel
- T007 and T008 are sequential (same file `ProgressRing.tsx` — execute in order to avoid conflicts)

### Parallel Opportunities

```text
After Phase 1 (T001) completes:

  Parallel group A (ProgressRing):    Parallel group B (FastingTimer):
  ├── T002 [US1] Confirmation circle  ├── T004 [US1] Wire long-press
  └── T003 [US1] Hold text feedback   └── T005 [US1] Remove End Fast button

After Phase 2 completes:

  Parallel group C:                   Sequential group D (same file):
  ├── T006 [US2] Always show ring     ├── T007 [US3] Smooth reset
  │                                   └── T008 [US3] Discoverability hint (after T007)
  │
  Parallel group E:
  ├── T009 Accessible fallback
  └── T011 Prevent context menu
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001)
2. Complete Phase 2: User Story 1 (T002–T005)
3. **STOP and VALIDATE**: Test long-press to end for goal-based sessions
4. Deploy/demo if ready — core experience is complete

### Incremental Delivery

1. Setup → US1 → **MVP delivered** (long-press works for goal sessions)
2. Add US2 → **All sessions supported** (no-goal sessions also have a ring)
3. Add US3 → **Polished experience** (smooth reset, discoverability hint)
4. Add Polish → **Production-ready** (accessibility, error handling, edge cases)

---

## Notes

- [P] tasks = different files or non-overlapping areas, no dependencies
- [Story] label maps task to specific user story for traceability
- No database migrations needed — pure frontend change
- No new dependencies to install
- The `useLongPress` hook is the single foundational piece — everything else builds on it
- Commit after each phase for clean incremental history
