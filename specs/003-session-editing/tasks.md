# Tasks: Session Editing

**Input**: Design documents from `/specs/003-session-editing/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md

**Tests**: Not requested — test tasks omitted.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create shared validation and dependencies needed by all user stories

- [x] T001 Install Zod dependency via `bun add zod`
- [x] T002 Create shared session edit Zod schema with time-ordering and future-time validation in `src/lib/validators.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Server action and modal component shell that all user stories build upon

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T003 Add `updateSession` server action in `src/app/actions/fasting.ts` — accepts sessionId, startedAt, endedAt; validates with Zod schema; verifies auth via `getUserId()`; updates database; calls `revalidatePath("/")`
- [x] T004 Create `SessionDetailModal` client component shell in `src/components/SessionDetailModal.tsx` — accepts session data and `onClose` callback; renders modal overlay with backdrop (fade-in), close button, session info (start time, end time, duration, protocol, goal status), Save button, and `motion-safe:animate-slide-up` entrance animation
- [x] T005 Wire history item tap handler in `src/components/FastingTimer.tsx` — add `selectedSession` state, render `SessionDetailModal` when a session is tapped in the history view, pass `onClose` to dismiss

**Checkpoint**: Modal opens when tapping a history item, shows session details, can be dismissed. Save button exists but does not yet edit times.

---

## Phase 3: User Story 1 — Edit Start Time (Priority: P1) 🎯 MVP

**Goal**: Users can tap the start time in the detail modal, pick a new time, see live duration recalculation, and save the change.

**Independent Test**: Tap a completed session → tap start time → change it → verify duration updates → tap Save → verify history list reflects the new time.

### Implementation for User Story 1

- [x] T006 [US1] Add editable start time field using `<input type="datetime-local">` in `src/components/SessionDetailModal.tsx` — pre-filled with current `startedAt`, styled with `min-h-11 rounded-xl` per design spec
- [x] T007 [US1] Add client-side validation for start time in `src/components/SessionDetailModal.tsx` — validate on change using Zod schema from `src/lib/validators.ts`; show inline error below field if `startedAt >= endedAt` or if time is in the future; disable Save button when errors present
- [x] T008 [US1] Add live duration recalculation in `src/components/SessionDetailModal.tsx` — when start time changes, compute and display updated duration from `startedAt` to `endedAt`
- [x] T009 [US1] Wire Save button to `updateSession` server action in `src/components/SessionDetailModal.tsx` — call action with edited startedAt (and current endedAt), handle success (close modal, refresh data) and error (show inline error message)

**Checkpoint**: User Story 1 fully functional — start time can be edited with validation and persistence.

---

## Phase 4: User Story 2 — Edit End Time (Priority: P1)

**Goal**: Users can also tap and edit the end time in the same detail modal, with the same validation and save behavior.

**Independent Test**: Tap a completed session → tap end time → change it → verify duration updates → tap Save → verify history list reflects the new end time.

### Implementation for User Story 2

- [x] T010 [US2] Add editable end time field using `<input type="datetime-local">` in `src/components/SessionDetailModal.tsx` — pre-filled with current `endedAt`, same styling as start time field
- [x] T011 [US2] Add client-side validation for end time in `src/components/SessionDetailModal.tsx` — validate on change; show inline error if `endedAt <= startedAt` or if time is in the future; update duration recalculation to also respond to end time changes

**Checkpoint**: Both start and end times are editable with validation, live duration recalculation, and persistence.

---

## Phase 5: User Story 3 — Overlap Validation (Priority: P2)

**Goal**: Server-side overlap detection prevents saving edits that would cause sessions to overlap.

**Independent Test**: Edit a session's time to overlap with an adjacent session → attempt Save → verify error message "This overlaps with another session" appears → correct the time → verify Save succeeds.

### Implementation for User Story 3

- [x] T012 [US3] Add overlap detection query to `updateSession` server action in `src/app/actions/fasting.ts` — before updating, query for any session (excluding current) where `startedAt < newEnd AND endedAt > newStart` for the same userId; return structured error if overlap found
- [x] T013 [US3] Handle overlap error in `src/components/SessionDetailModal.tsx` — display "This overlaps with another session" as inline error when server returns overlap error; keep Save enabled for retry after correction

**Checkpoint**: All three user stories are complete. Full session editing flow works with time ordering, future-time, and overlap validation.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: UX refinements and error handling

- [x] T014 Add network error handling in `src/components/SessionDetailModal.tsx` — show generic "Something went wrong. Please try again." message on unexpected server errors
- [ ] T015 Run quickstart.md validation — manually test all scenarios from `specs/003-session-editing/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 (Zod schema needed by server action and modal)
- **User Stories (Phases 3-5)**: All depend on Phase 2 (modal shell + server action)
  - US1 and US2 are both P1 but US2 builds on the same modal as US1, so sequential is recommended
  - US3 depends on US1/US2 (needs working Save flow to test overlap errors)
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Phase 2 — no dependencies on other stories
- **User Story 2 (P1)**: Can start after Phase 2 — adds end time field to same modal as US1, recommend after US1 to avoid merge conflicts
- **User Story 3 (P2)**: Depends on US1/US2 — needs working save flow to validate overlap detection

### Within Each User Story

- Field creation before validation
- Validation before save wiring
- Save wiring before error handling

### Parallel Opportunities

- T001 and T002 can run in parallel (install + schema creation)
- T003 and T004 can run in parallel (server action + modal shell are separate files)
- T014 and T015 can run in parallel (animation + error handling are independent concerns)

---

## Parallel Example: Phase 2

```bash
# These can run in parallel (different files):
Task: "Add updateSession server action in src/app/actions/fasting.ts"
Task: "Create SessionDetailModal shell in src/components/SessionDetailModal.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (install Zod, create schema)
2. Complete Phase 2: Foundational (server action + modal shell + wire tap handler)
3. Complete Phase 3: User Story 1 (edit start time)
4. **STOP and VALIDATE**: Test editing start time independently
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add User Story 1 (edit start time) → Test → Deploy (MVP!)
3. Add User Story 2 (edit end time) → Test → Deploy
4. Add User Story 3 (overlap validation) → Test → Deploy
5. Polish → Final deploy

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- No database migration needed — existing FastingSession model has all required fields
- Commit after each phase completion
- Stop at any checkpoint to validate independently
