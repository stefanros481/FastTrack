# Tasks: Backend Readiness Check

**Input**: Design documents from `/specs/020-backend-readiness/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/health-api.md, quickstart.md

**Tests**: Not requested. No test tasks included.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create new files and shared infrastructure needed by all user stories

- [x] T001 Create ConnectionContext provider with `useConnection()` hook in `src/contexts/ConnectionContext.tsx`. Provider calls `useConnectionStatus()` once and shares the status value via context. Export `ConnectionProvider` and `useConnection()`.
- [x] T002 Create ConnectionGuard wrapper component in `src/components/ConnectionGuard.tsx`. Accepts `children` (button element), reads connection status from `useConnection()` context, disables the child when status is not `"online"`, and shows a tooltip message ("System connecting, please wait...") on tap of a disabled button. Tooltip auto-dismisses after 2 seconds. Must meet 44x44px touch target minimum.
- [x] T003 Wrap the app layout with `ConnectionProvider`. Create or update a client-side providers wrapper (e.g., `src/components/Providers.tsx` or inline in `src/app/layout.tsx`) that wraps the app's `children` with `<ConnectionProvider>`. The provider MUST be high enough in the tree to cover both the home page (`/`) and settings page (`/settings`), so it must be in the root layout, not inside any individual page component.

**Checkpoint**: Shared infrastructure ready -- ConnectionContext and ConnectionGuard available for all user stories.

---

## Phase 2: User Story 1 - Deep Health Check Validates Full Backend Readiness (Priority: P1) MVP

**Goal**: Replace the shallow `SELECT 1` health check with a deep check that queries an application table and validates auth, ensuring "Online" means the backend can actually process commands.

**Independent Test**: Open the app after database inactivity. Health check should query the `User` table (not just ping) and validate auth. If either fails, indicator shows "Offline" not "Online".

### Implementation for User Story 1

- [x] T004 [US1] Enhance health check endpoint in `src/app/api/health/route.ts`. Replace `prisma.$queryRaw\`SELECT 1\`` with a Prisma query against the `User` table using `WHERE false` (e.g., `prisma.user.count({ where: { id: 'nonexistent' } })` or equivalent lightweight query that adds < 50ms overhead per FR-009). Keep the `auth()` check that's already there. Return structured response: `{ status: "ok" | "error", checks: { database: "ok" | "error", auth: "ok" | "error" } }`. Return 200 when all pass, 503 when any fail. Run auth check first; if auth fails return 401. Run database check in try/catch; if it fails, set `checks.database = "error"` and return 503. Verify the chosen query is lightweight by confirming it returns zero rows instantly (no table scan).
- [x] T005 [US1] Update `useConnectionStatus` hook in `src/hooks/useConnectionStatus.ts` to add 10-second timeout using `AbortController`. Create controller before each fetch, set `setTimeout(() => controller.abort(), 10000)`, pass `{ signal: controller.signal }` to fetch. Clear timeout on response. On `AbortError`, treat as failure (set offline, start retry).
- [x] T006 [US1] Update `FastingTimer.tsx` to use `useConnection()` from ConnectionContext instead of directly calling `useConnectionStatus()`. Remove the direct `useConnectionStatus()` import and call; replace with `const connectionStatus = useConnection()`. Keep the existing `ConnectionStatus` indicator rendering and Start Fast button disabling logic unchanged.

**Checkpoint**: Deep health check validates app table + auth. "Online" now means genuinely ready. Start Fast button still disabled when not online.

---

## Phase 3: User Story 4 - Blocking Critical Actions Until Ready (Priority: P1)

**Goal**: Extend write-action blocking from just "Start Fast" to all mutation buttons across settings, session editing, and notes.

**Independent Test**: While health check is in "Connecting" or "Offline" state, attempt to tap settings saves, session edit Save, Delete, and note auto-save. All should be blocked with disabled state and tooltip.

### Implementation for User Story 4

- [x] T007 [P] [US4] Wrap goal preset buttons in `src/components/DefaultGoalSetting.tsx` with `ConnectionGuard`. Import `ConnectionGuard` and wrap each goal button (12h, 16h, 18h, 20h, 24h, Custom, and the custom save button) so they are disabled when not online.
- [x] T008 [P] [US4] Wrap reminder and notification controls in `src/components/NotificationSettings.tsx` with `ConnectionGuard`. Wrap the reminder toggle switch, time picker confirmation, and max duration input save action so they are disabled when not online.
- [x] T009 [P] [US4] Wrap gamification toggles in `src/components/GamificationSettings.tsx` with `ConnectionGuard`. Wrap the master gamification toggle and individual feature toggles so they are disabled when not online.
- [x] T010 [P] [US4] Wrap Save and Delete buttons in `src/components/SessionDetailModal.tsx` with `ConnectionGuard`. Wrap the Save button and the Delete Session button (or its confirmation trigger) so they are disabled when not online. Note: Delete here applies to completed sessions in history, not ending an active session -- blocking it is correct per FR-005. Do NOT wrap the Cancel/Close button.
- [x] T011 [US4] Block auto-save in `src/components/NoteInput.tsx` when not online. Import `useConnection()` from ConnectionContext. In the blur handler that triggers auto-save, check if status is `"online"` before calling the save action. If not online, show a brief inline message (e.g., "Cannot save while offline") below the textarea per FR-006. The note content stays in the textarea, unsaved, so the user can retry once online.
- [x] T012 [US4] Ensure end/cancel active session buttons remain unblocked. In `src/components/FastingTimer.tsx`, verify that the "End Session" and "Cancel" buttons are NOT wrapped with `ConnectionGuard` and remain functional regardless of connection status. This is an explicit exception per spec.

**Checkpoint**: All write actions blocked when not online (except end/cancel session). Tapping disabled buttons shows tooltip.

---

## Phase 4: User Story 2 - Granular Status Reporting (Priority: P2)

**Goal**: Distinguish between "warming up" (temporary, < 3 failures) and "unavailable" (persistent, >= 3 failures) in the connection status indicator.

**Independent Test**: Simulate offline state. Initially shows "Connecting..." → after 3 failed retries (~15s) transitions to "Unavailable" with red dot. Recovery shows "Online".

### Implementation for User Story 2

- [x] T013 [US2] Extend `ConnectionStatus` type in `src/hooks/useConnectionStatus.ts`. Add `"unavailable"` to the type: `export type ConnectionStatus = "connecting" | "online" | "offline" | "unavailable"`. Add a `failCountRef = useRef(0)` to track consecutive failures. On failure: increment `failCountRef.current`; if >= 3 set status to `"unavailable"`, else set to `"offline"`. On success: reset `failCountRef.current = 0` and set status to `"online"`. Ensure retries continue in both `"offline"` and `"unavailable"` states.
- [x] T014 [US2] Update `ConnectionStatus` component in `src/components/ConnectionStatus.tsx` to handle the new `"unavailable"` state. Add a fourth config entry: `unavailable: { dotClass: "bg-[var(--color-error)]", label: "Unavailable" }`. The "unavailable" state should stay visible (not auto-hide), same as "offline". Ensure the `Phase` logic treats `"unavailable"` same as `"offline"` (always visible).
- [x] T015 [US2] Update `ConnectionGuard` in `src/components/ConnectionGuard.tsx` to also disable on `"unavailable"` status (should already work if checking `!== "online"`, but verify).

**Checkpoint**: Indicator shows "Connecting..." for initial/early failures, transitions to "Unavailable" after 3 failures. All states correctly block/unblock buttons.

---

## Phase 5: User Story 3 - Health Check Response Time Budget (Priority: P2)

**Goal**: Enforce a 10-second timeout on health check requests so users don't wait indefinitely in "Connecting..." state.

**Independent Test**: Simulate a slow/hanging database connection. Health check should timeout at 10 seconds, transition to "Offline", and retry.

### Implementation for User Story 3

- [x] T016 [US3] Verify timeout implementation from T005 works correctly in `src/hooks/useConnectionStatus.ts`. The AbortController timeout from T005 already implements this story. Verify: (a) timeout fires after 10 seconds, (b) AbortError is caught and treated as failure, (c) retry starts after timeout failure, (d) each retry also has the same 10-second timeout. Ensure the `setTimeout` is cleared in the cleanup function to prevent memory leaks.

**Checkpoint**: Health check never hangs indefinitely. 10-second timeout ensures prompt failure detection and retry.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final cleanup and validation across all stories

- [x] T017 Verify `ConnectionGuard` tooltip meets accessibility requirements. Ensure tooltip text is readable, contrast ratio meets WCAG standards using design tokens, and tooltip doesn't overlap other interactive elements. Test on 375px viewport.
- [x] T018 Run quickstart.md validation scenarios manually. Walk through all 6 test scenarios from `specs/020-backend-readiness/quickstart.md`: normal flow, cold start, persistent failure, recovery, timeout, and end/cancel while offline. Additionally verify SC-006: after "Online" transition, confirm all previously blocked buttons re-enable within 2 seconds.
- [x] T019 Clean up imports and remove any unused code. Remove the direct `useConnectionStatus` import from `FastingTimer.tsx` if it was replaced by context. Ensure no duplicate polling logic exists.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies -- can start immediately
- **User Story 1 (Phase 2)**: Depends on T001 (ConnectionContext) and T003 (provider wiring)
- **User Story 4 (Phase 3)**: Depends on T002 (ConnectionGuard) and T003 (provider wiring) and T006 (FastingTimer context migration)
- **User Story 2 (Phase 4)**: Depends on T005 (hook updates from US1)
- **User Story 3 (Phase 5)**: Depends on T005 (timeout already implemented in US1)
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Needs Setup phase complete. MVP -- delivers the core deep health check.
- **User Story 4 (P1)**: Needs Setup phase + US1 T006 (context migration). Can partially parallel with US1 (T007-T010 can start once T002 and T003 are done).
- **User Story 2 (P2)**: Needs US1 hook changes (T005/T013 modify same file). Must be sequential after US1.
- **User Story 3 (P2)**: Effectively completed by T005 in US1. T016 is verification only.

### Within Each User Story

- Core implementation before integration
- Same-file tasks must be sequential
- Different-file tasks marked [P] can run in parallel

### Parallel Opportunities

- T001 and T002 can run in parallel (different new files)
- T007, T008, T009, T010 can all run in parallel (different component files)
- US3 (T016) is verification only and can overlap with US2 work

---

## Parallel Example: User Story 4

```text
# After T002 (ConnectionGuard) and T003 (provider) are complete, launch all wrapper tasks together:
Task T007: "Wrap goal buttons in src/components/DefaultGoalSetting.tsx"
Task T008: "Wrap notification controls in src/components/NotificationSettings.tsx"
Task T009: "Wrap gamification toggles in src/components/GamificationSettings.tsx"
Task T010: "Wrap Save/Delete in src/components/SessionDetailModal.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T003)
2. Complete Phase 2: User Story 1 (T004-T006)
3. **STOP and VALIDATE**: Health check now validates app table + auth. "Online" is trustworthy.
4. Deploy/demo if ready

### Incremental Delivery

1. Setup (T001-T003) → Infrastructure ready
2. User Story 1 (T004-T006) → Deep health check MVP
3. User Story 4 (T007-T012) → All write actions protected
4. User Story 2 (T013-T015) → Granular status messages
5. User Story 3 (T016) → Timeout verification
6. Polish (T017-T019) → Final cleanup and validation

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- No schema changes or migrations required
- No new dependencies to install
- Total: 19 tasks across 6 phases
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
