# Tasks: Database Connection Status Indicator

**Input**: Design documents from `/specs/015-connection-status/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: Not requested — no test tasks included.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create the health check endpoint that all user stories depend on

- [x] T001 Create health check API route that verifies database connectivity via `SELECT 1` in `src/app/api/health/route.ts`. Must check auth session, return `{ status: "ok" }` (200) or `{ status: "error" }` (503). Set `dynamic = "force-dynamic"`. Follow existing API route patterns from `src/app/api/sessions/route.ts`.

**Checkpoint**: Health check endpoint is deployed and returns 200/503 when hit directly via browser/curl (while authenticated).

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Create the polling hook that provides connection status to UI components

**CRITICAL**: No user story UI work can begin until this phase is complete

- [x] T002 Create `useConnectionStatus` custom hook in `src/hooks/useConnectionStatus.ts`. Must return `status: "connecting" | "online" | "offline"`. On mount: fetch `GET /api/health`. On success: set `"online"`, stop polling. On failure: set `"offline"`, retry every 5 seconds via `setInterval`. Clean up interval on unmount. Follow existing hook patterns from `src/hooks/useChartData.ts`.

**Checkpoint**: Hook can be tested by importing into any client component and logging status transitions in the console.

---

## Phase 3: User Story 1+2 — Status Indicator Display (Priority: P1)

**Goal**: Show a connection status pill in the header that transitions through Connecting → Online (auto-hides) states. Disable "Start Fast" button while not online.

**Independent Test**: Open app after DB has been idle 5+ minutes. See yellow "Connecting..." indicator, then green "Online" that fades after 3s. "Start Fast" is disabled during "Connecting" and enabled after "Online".

### Implementation for User Story 1+2

- [x] T003 [P] [US1+US2] Create `ConnectionStatus` component in `src/components/ConnectionStatus.tsx`. Accepts `status: "connecting" | "online" | "offline"` prop. Renders a small pill badge with colored dot + label text. States: yellow dot + "Connecting..." (with `motion-safe:animate-pulse` on dot), green dot + "Online", red dot + "Offline". Use design tokens: `--color-warning`, `--color-success`, `--color-error`. When status is `"online"`, auto-hide after 3 seconds using opacity fade transition (CSS `transition: opacity 300ms`) then unmount. Position: inline in header, meant to sit before the ThemeToggle. Minimum touch target not required (non-interactive element).

- [x] T004 [US1+US2] Integrate `ConnectionStatus` and `useConnectionStatus` into `src/components/FastingTimer.tsx`. Import hook and component. Call `useConnectionStatus()` at top of `FastingTimer`. Render `<ConnectionStatus status={status} />` in the header between the logo/title `div` and `<ThemeToggle />`. Pass connection status to the "Start Fast" button: add `disabled={status !== "online"}` alongside existing `isPending` disabled logic. Do NOT disable end/cancel session buttons or navigation tabs.

**Checkpoint**: User Story 1+2 fully functional — indicator shows on load, transitions to Online, auto-hides, and Start Fast button respects connection status.

---

## Phase 4: User Story 3+4 — Offline State & Auto-Retry (Priority: P2)

**Goal**: Show "Offline" state with red indicator when health check fails. Automatically retry and recover without page refresh.

**Independent Test**: Block network in DevTools → see red "Offline" indicator and disabled Start button. Re-enable network → indicator auto-transitions to green "Online" within ~5 seconds.

### Implementation for User Story 3+4

- [x] T005 [US3+US4] Verify offline behavior in `src/components/ConnectionStatus.tsx` and `src/hooks/useConnectionStatus.ts`. The "Offline" state (red dot, persistent, no auto-hide) and auto-retry (5s interval until success) should already work from T002 and T003. Manually test: open DevTools → Network → Offline, observe red "Offline" indicator appears and Start button is disabled. Re-enable network, observe auto-recovery to "Online" within one retry cycle. If any behavior is missing, fix in the respective files.

**Checkpoint**: All 4 user stories work — Connecting, Online (auto-hide), Offline (persistent), and auto-retry recovery are all functional.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Final verification and edge case handling

- [x] T006 Verify edge cases from spec in `src/components/FastingTimer.tsx` and `src/hooks/useConnectionStatus.ts`: (1) Active session on load — timer displays, end session button is NOT disabled regardless of connection status. (2) 375px viewport — indicator fits in header without overflow or wrapping. (3) Dark mode — indicator colors are visible and correct in both light and dark themes. (4) Reduced motion — pulse animation on yellow dot only appears with `motion-safe:`.
- [x] T007 Run quickstart.md validation: walk through all 4 test scenarios from `specs/015-connection-status/quickstart.md` and confirm each passes.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on T001 (hook calls the endpoint)
- **User Story 1+2 (Phase 3)**: Depends on T002 (component uses the hook)
- **User Story 3+4 (Phase 4)**: Depends on Phase 3 (verification of existing behavior)
- **Polish (Phase 5)**: Depends on all user stories being complete

### User Story Dependencies

- **US1+US2 (P1)**: Requires foundational hook (T002). Core feature — must complete first.
- **US3+US4 (P2)**: Functionally built into US1+US2 implementation. Phase 4 is verification only.

### Within Each Phase

- T003 and T004 are sequential (T004 imports T003's component)
- T005 is verification of T002+T003 behavior
- T006 and T007 are sequential (T006 fixes, T007 validates)

### Parallel Opportunities

- T003 can run in parallel with other work since it creates a new file
- T001 and T002 are sequential (T002 calls T001's endpoint)
- Overall this is a small, linear feature — limited parallelism

---

## Implementation Strategy

### MVP First (User Story 1+2 Only)

1. Complete Phase 1: Health check endpoint (T001)
2. Complete Phase 2: Polling hook (T002)
3. Complete Phase 3: Indicator + integration (T003, T004)
4. **STOP and VALIDATE**: Test indicator lifecycle — Connecting → Online → auto-hide
5. Deploy if ready — offline/retry behavior already works from the hook implementation

### Incremental Delivery

1. T001 → Endpoint deployed, testable via curl
2. T002 → Hook ready, testable via console
3. T003+T004 → Full UI indicator working (MVP!)
4. T005 → Offline/retry verified
5. T006+T007 → Edge cases and final validation

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- US1+US2 and US3+US4 are combined because they share implementation — the states are built together, not independently
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
