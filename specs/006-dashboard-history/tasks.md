# Tasks: Dashboard — History

**Input**: Design documents from `/specs/006-dashboard-history/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: Not requested — no test framework configured. Skipping test tasks.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: No new project setup required — this feature builds on the existing Next.js project. This phase creates the shared foundation components used across multiple user stories.

- [X] T001 [P] Create `SessionCard` component in `src/components/SessionCard.tsx` — a tappable card displaying: date, start→end time range, duration (hours), goal-met indicator (success badge if `goalMinutes != null && duration >= goal`, muted if goal not met), protocol/goal label, truncated note preview. Use design tokens: `bg-[--color-card]`, `rounded-2xl`, `p-4`, `min-h-11`. Accept `session` and `onSelect` props. Compute `durationHours` and `goalMet` from session data. Include a chevron-right icon (Lucide `ChevronRight`).

- [X] T002 [P] Create `SessionCardSkeleton` component in `src/components/SessionCardSkeleton.tsx` — a loading placeholder matching `SessionCard` dimensions. Use `animate-pulse` with `bg-slate-200 dark:bg-slate-700` rounded bars for each data row (duration, time range, note). Accept an optional `count` prop (default 3) to render multiple skeletons. Same card styling: `bg-[--color-card]`, `rounded-2xl`, `p-4`.

- [X] T003 Add `deleteSessionSchema` to `src/lib/validators.ts` — a Zod schema validating `{ sessionId: z.string().min(1) }`. Export the schema and its inferred type.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: API route for paginated session fetching — MUST be complete before the history list can fetch data.

**CRITICAL**: No user story work can begin until this phase is complete.

- [X] T004 Create paginated API route in `src/app/api/sessions/route.ts` — implement `GET` handler per the API contract (`specs/006-dashboard-history/contracts/api-sessions.md`). Authenticate via `auth()`, return 401 if unauthenticated. Parse `cursor` and `pageSize` query params (default pageSize=20, max 50). Query Prisma: `fastingSession.findMany` with `where: { userId, endedAt: { not: null } }`, `orderBy: { startedAt: 'desc' }`, `take: pageSize`, `select: { id, startedAt, endedAt, goalMinutes, notes }`. When cursor is provided, add `cursor: { id: cursor }` and `skip: 1`. Fetch `pageSize + 1` records, return only the first `pageSize` to the client, and set `hasMore = fetchedCount > pageSize`. This avoids an unnecessary empty-result request when the total is an exact multiple of pageSize. Return `{ data, nextCursor, hasMore }` as JSON. Serialize dates to ISO strings.

- [X] T005 Add `deleteSession` server action to `src/app/actions/fasting.ts` — per the contract (`specs/006-dashboard-history/contracts/delete-session-action.md`). Validate `sessionId` with `deleteSessionSchema`. Authenticate via `auth()`. Delete with `prisma.fastingSession.delete({ where: { id: sessionId, userId } })`. Catch "record not found" errors → return `{ success: false, error: "Session not found" }`. On success, call `revalidatePath("/")` and return `{ success: true }`. Export `DeleteSessionResult` type.

**Checkpoint**: API route returns paginated sessions; deleteSession action works server-side.

---

## Phase 3: User Story 1 — View Fasting History (Priority: P1) MVP

**Goal**: Users see a paginated, chronological list of completed fasting sessions in the Log tab with infinite scroll, skeleton loading, and empty state.

**Independent Test**: Navigate to the Log tab. Verify completed sessions appear newest-first in redesigned cards. Scroll to bottom to trigger loading of more sessions. Verify skeleton cards appear during loading. With no sessions, verify empty state shows.

### Implementation for User Story 1

- [X] T006 [US1] Create `HistoryList` component in `src/components/HistoryList.tsx` — a `"use client"` component that manages paginated history. State: `sessions` array, `cursor` (string|null), `hasMore` (boolean), `isLoading` (boolean), `isInitialLoad` (boolean). On mount, fetch first page from `/api/sessions?pageSize=20`. Use `IntersectionObserver` on a sentinel `<div>` at the bottom of the list to trigger `loadMore` when visible. Append new page results to existing sessions. Show `<SessionCardSkeleton count={3} />` during initial load. Show `<SessionCardSkeleton count={2} />` at bottom during page loads. Show empty state (Lucide `History` icon + "No fasting sessions yet" text, centered, `py-20`) when sessions is empty after initial load. Render `<SessionCard>` for each session with `motion-safe:animate-slide-up` stagger (use inline `style={{ animationDelay }}` with index-based delay). Accept `onSelectSession` callback prop to handle card taps.

- [X] T007 [US1] Modify `src/components/FastingTimer.tsx` — replace the inline history rendering (the `view === "history"` block, approximately lines 437–491) with `<HistoryList onSelectSession={setSelectedSession} />`. Remove the `historyWithDuration` useMemo (no longer needed — computation moves into SessionCard). Remove the `history` prop from the component's Props interface since history data is now fetched client-side by HistoryList. Keep the `selectedSession` state and `SessionDetailModal` rendering unchanged for now.

- [X] T008 [US1] Update `src/app/page.tsx` — remove `getHistory()` from the `Promise.all` call since history is now fetched client-side via the API route. Remove the `history` prop serialization and passing to `<FastingTimer>`. Keep `getActiveFast()`, `getStats()`, and `getTheme()` unchanged.

**Checkpoint**: Log tab shows paginated history with infinite scroll, skeleton loading, and empty state. Each card displays session data correctly. This is the MVP — validate independently.

---

## Phase 4: User Story 2 — View Session Details (Priority: P1)

**Goal**: Users can tap any session card to open the detail/edit modal with full session information.

**Independent Test**: Tap any session card in the history list. Verify the session detail modal opens with correct data (dates, duration, goal status, notes). Edit a field and save. Verify the change persists and the history list reflects the update.

**Note**: The existing `SessionDetailModal` already handles detail viewing and editing. This phase wires it into the new `HistoryList` flow and ensures data consistency after edits.

### Implementation for User Story 2

- [X] T009 [US2] Wire `SessionDetailModal` into `HistoryList` in `src/components/HistoryList.tsx` — add `selectedSession` state (CompletedSession | null). When `onSelectSession` triggers (from SessionCard tap), set `selectedSession`. Render `<SessionDetailModal session={selectedSession} onClose={handleModalClose} />` when `selectedSession` is non-null. On `handleModalClose`: clear `selectedSession` state, and refetch the current page data from the API to reflect any edits (reset sessions list and re-fetch from first page, or optimistically update the edited session in the local array).

- [X] T010 [US2] Update `src/components/FastingTimer.tsx` — remove the `selectedSession` state and `SessionDetailModal` rendering from FastingTimer since this is now handled inside `HistoryList`. Simplify the FastingTimer component to only render `<HistoryList />` for the history view with no additional props for session selection.

**Checkpoint**: Tapping a session card opens the detail modal. Editing and saving updates the history list. Modal close returns to the list.

---

## Phase 5: User Story 3 — Delete a Session (Priority: P2)

**Goal**: Users can delete a fasting session from the detail modal with a confirmation step.

**Independent Test**: Open a session detail modal. Tap the delete button. Verify the confirmation prompt appears with "Delete this session? This cannot be undone." Confirm deletion. Verify the session disappears from the history list and stats update. Also test: tap Cancel and verify session remains.

### Implementation for User Story 3

- [X] T011 [P] [US3] Create `DeleteConfirmation` component in `src/components/DeleteConfirmation.tsx` — a confirmation prompt rendered inline within the session detail modal. Props: `onConfirm`, `onCancel`, `isDeleting` (boolean for pending state). Display text: "Delete this session? This cannot be undone." Confirm button: `bg-[--color-error]`, `rounded-full`, `min-h-11`, white text, shows "Deleting..." when `isDeleting` is true. Cancel button: `text-[--color-text-muted]`, `min-h-11`. Both buttons side by side. Animate entrance with `motion-safe:animate-fade-in`.

- [X] T012 [US3] Extend `SessionDetailModal` in `src/components/SessionDetailModal.tsx` — add a delete button at the bottom of the modal: `text-[--color-error]`, body text level, `min-h-11`, with Lucide `Trash2` icon. Add `showDeleteConfirm` boolean state. When delete is tapped, set `showDeleteConfirm = true` and render `<DeleteConfirmation>` replacing the delete button area. On confirm: call `deleteSession(session.id)` server action, handle result — on success call `onClose()` (which triggers list refresh in HistoryList), on failure show error message inline (`text-[--color-error]`). On cancel: set `showDeleteConfirm = false`. Add `onDelete` optional callback prop so HistoryList can react to deletions.

- [X] T013 [US3] Handle deletion in `HistoryList` in `src/components/HistoryList.tsx` — when the session detail modal closes after a deletion, remove the deleted session from the local `sessions` array (optimistic removal) and refetch to ensure consistency. If the deletion results in an empty list, show the empty state. Update the `handleModalClose` to accept an optional `{ deleted: boolean }` parameter to distinguish between close-after-edit and close-after-delete. Additionally, after a successful deletion, call `router.refresh()` (from `next/navigation`) to force the server component in `page.tsx` to re-render, ensuring stats displayed in the Dashboard/Insights tab reflect the deletion without requiring manual navigation.

**Checkpoint**: Delete flow works end-to-end in 3 taps. Confirmation prevents accidents. History list updates after deletion. Empty state appears when last session is deleted.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Animations, edge case handling, and cleanup across all user stories.

- [X] T014 [P] Add staggered card entrance animation — in `src/components/HistoryList.tsx`, ensure each `SessionCard` wrapper has `motion-safe:animate-slide-up` with staggered `animationDelay` based on index within the page (e.g., `index * 50ms`, capped at 10 items to avoid long delays). New pages should animate from their first item. Verify animation respects `prefers-reduced-motion`.

- [X] T015 [P] Handle edge cases in `src/components/HistoryList.tsx` — prevent duplicate fetch requests when scrolling rapidly (guard `loadMore` with `isLoading` check). Ensure the IntersectionObserver disconnects on unmount. Handle fetch errors gracefully (show a retry message or toast, keep existing sessions intact). Ensure exactly-20-sessions edge case doesn't show a spinner indefinitely (rely on `hasMore` from API).

- [X] T016 Verify build succeeds — run `bun run build` to ensure no TypeScript errors, no import issues, and no breaking changes to existing functionality (timer view, dashboard/insights view, session editing).

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — T001, T002, T003 can all run in parallel immediately
- **Foundational (Phase 2)**: T004 (API route) depends on nothing; T005 (deleteSession) depends on T003 (schema)
- **US1 (Phase 3)**: Depends on T001 (SessionCard), T002 (Skeleton), T004 (API route)
- **US2 (Phase 4)**: Depends on US1 completion (T006, T007, T008)
- **US3 (Phase 5)**: Depends on T005 (deleteSession action) and US2 completion (T009, T010). T011 (DeleteConfirmation) can run in parallel with US2.
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (P1)**: Can start after Phase 1 + T004 — no dependencies on other stories
- **US2 (P1)**: Depends on US1 — needs HistoryList to exist before wiring in the modal
- **US3 (P2)**: Depends on US2 — needs the modal integration to add delete button. T011 (DeleteConfirmation component) can be built in parallel with US1/US2.

### Parallel Opportunities

**Phase 1** (all parallel):
```
T001 (SessionCard) | T002 (SessionCardSkeleton) | T003 (deleteSessionSchema)
```

**Phase 2** (partially parallel):
```
T004 (API route) | T005 (deleteSession action, after T003)
```

**Phase 5** (T011 can start early):
```
T011 (DeleteConfirmation) can be built during Phase 3 or 4
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001–T003) — parallel
2. Complete Phase 2: Foundational (T004–T005)
3. Complete Phase 3: User Story 1 (T006–T008)
4. **STOP and VALIDATE**: Navigate to Log tab, verify paginated history works
5. Deploy/demo if ready — this alone delivers the core value

### Incremental Delivery

1. Phase 1 + Phase 2 → Foundation ready
2. Add US1 (Phase 3) → Paginated history list → **Deploy (MVP!)**
3. Add US2 (Phase 4) → Session detail modal integration → Deploy
4. Add US3 (Phase 5) → Delete with confirmation → Deploy
5. Polish (Phase 6) → Animations + edge cases → Deploy

---

## Notes

- No database migrations needed — `FastingSession` schema already has all required fields
- No new dependencies to install — uses native `IntersectionObserver`, existing Prisma/Zod/Lucide
- The `getHistory()` function in `src/app/actions/fasting.ts` can be left in place (other features may use it) or removed during polish if confirmed unused
- The `history` prop removal from `FastingTimer` (T007/T008) is a breaking change that must happen together
- Commit after each phase checkpoint for clean rollback points
