# Tasks: Session Notes

**Input**: Design documents from `/specs/004-session-notes/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: No automated tests — manual testing only (no test framework configured).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Database migration and shared validation schema

- [X] T001 Add `@db.VarChar(280)` constraint to `notes` field in `prisma/schema.prisma` and run `bunx prisma migrate dev --name add-notes-varchar-constraint` to generate migration
- [X] T002 [P] Add `noteSchema` Zod validator to `src/lib/validators.ts` — validates `sessionId` (non-empty string) and `note` (string max 280 chars, nullable); export `UpdateNoteInput` type (avoid naming collision with the `NoteInput` React component)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Server action and data plumbing that ALL user stories depend on

**CRITICAL**: No user story work can begin until this phase is complete

- [X] T003 Add `updateNote` server action to `src/app/actions/fasting.ts` — authenticate via `auth()`, validate with `noteSchema`, trim note (whitespace-only → `null`), find session by id AND userId, update `notes` field, return `{ success: true }` or `{ success: false, error: string }`. Follow contract in `specs/004-session-notes/contracts/server-actions.md`
- [X] T004 [P] Update `getActiveFast()` in `src/app/actions/fasting.ts` to include `notes` field in Prisma select and return type
- [X] T005 [P] Update `getHistory()` in `src/app/actions/fasting.ts` to include `notes` field in Prisma select and return type
- [X] T006 Update `src/app/page.tsx` to pass `notes` field through data mapping for both `activeFast` and `history` props to `FastingTimer`

**Checkpoint**: Data layer complete — notes can be read and written via server actions; notes data flows to the client.

---

## Phase 3: User Story 1 - Add a Note to an Active Fast (Priority: P1) MVP

**Goal**: Users can add an optional note to their active fasting session from the active fast screen. Notes auto-save on blur with a "Saved" indicator.

**Independent Test**: Start a fast → type a note → tap outside → "Saved" appears → refresh page → note persists.

### Implementation for User Story 1

- [X] T007 [US1] Create `src/components/NoteInput.tsx` — a `"use client"` component that accepts `{ sessionId: string, initialNote: string | null, onSaved?: () => void }`. Implement: controlled textarea with `maxLength={280}`, placeholder text "Add a note...", character counter (`{count}/280`) right-aligned below textarea, warning color (`text-[--color-error]`) at count >= 260, auto-save on blur via `useTransition` + `updateNote` server action with dirty check (skip if unchanged from initial after trim). Before calling the server action, validate with `noteSchema.parse()` client-side (Constitution Principle IV: Zod both client and server). Show "Saved" indicator for 1.5s on success, error display on failure. Textarea styling: `rounded-xl`, `bg-[--color-background]`, `text-[--color-text]` (design token, not hardcoded slate — ensures dark mode compatibility per Constitution V), `text-base`, `p-4`, `min-h-11`. Counter: `text-sm text-[--color-text-muted]`. Paste truncation at 280 chars. Add code comment noting that navigating away before blur may lose unsaved text (accepted per spec edge case).
- [X] T008 [US1] Update `src/components/FastingTimer.tsx` — add `notes: string | null` to the `activeFast` prop type interface. In the timer view (active fast section), render `<NoteInput sessionId={activeFast.id} initialNote={activeFast.notes} />` below the timer display. Import `NoteInput` and `updateNote` action as needed.

**Checkpoint**: User Story 1 fully functional — user can add/edit a note on the active fast screen with character counter and auto-save on blur.

---

## Phase 4: User Story 2 - Edit a Note on a Completed Session (Priority: P2)

**Goal**: Users can add, edit, or clear a note on a completed session from the session detail modal. Same auto-save on blur behavior as active fast screen.

**Independent Test**: Open a completed session → tap note area → type/edit → tap outside → "Saved" appears → reopen modal → note persists. Clear all text → tap outside → note removed.

### Implementation for User Story 2

- [X] T009 [US2] Update `SessionData` interface in `src/components/SessionDetailModal.tsx` to include `notes: string | null`. Add `<NoteInput sessionId={session.id} initialNote={session.notes} />` to the modal layout below the time editing fields and above the save button. The textarea is always visible (not tap-to-reveal) — same pattern as active fast screen, satisfies US2 acceptance scenarios while keeping implementation simple. Import `NoteInput`.
- [X] T010 [US2] Update `src/components/FastingTimer.tsx` — add `notes: string | null` to the `history` session type interface. Pass `notes` through when setting `selectedSession` state and when rendering `<SessionDetailModal>`.

**Checkpoint**: User Stories 1 AND 2 fully functional — notes can be added/edited on both active fasts and completed sessions.

---

## Phase 5: User Story 3 - View Note Previews in History (Priority: P3)

**Goal**: Session cards in the history list show a truncated one-line preview of the note. Cards without notes show no note area.

**Independent Test**: Add notes to several sessions → navigate to history tab → verify each card with a note shows a truncated preview; cards without notes show no preview.

### Implementation for User Story 3

- [X] T011 [US3] Update session card rendering in `src/components/FastingTimer.tsx` — in the history view's session card `<button>`, add a conditional note preview below the date range: `{entry.notes && <p className="text-sm text-[--color-text-muted] truncate mt-1">{entry.notes}</p>}`. Only render when `entry.notes` is non-null (FR-011).

**Checkpoint**: All 3 user stories functional — notes can be added, edited, cleared, and previewed across all views.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Edge case handling and final validation

- [X] T012 Manual test: verify paste truncation at 280 characters in `NoteInput` textarea
- [X] T013 Manual test: verify whitespace-only note saves as null (cleared) — type spaces, blur, verify no note persists
- [X] T014 Manual test: verify 375px mobile viewport layout — note input and character counter display correctly, touch targets meet 44x44px minimum
- [X] T015 Run `bunx prisma migrate dev` to confirm migration applies cleanly, then run `bun run build` to verify no TypeScript errors

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on T001 (migration) for T003; T002 (Zod schema) for T003. T004, T005 can start after T001.
- **User Story 1 (Phase 3)**: Depends on Phase 2 completion (T003-T006)
- **User Story 2 (Phase 4)**: Depends on Phase 2 + T007 (NoteInput component from US1)
- **User Story 3 (Phase 5)**: Depends on Phase 2 (T004/T005 for notes in data). Can run in parallel with US2.
- **Polish (Phase 6)**: Depends on all user stories complete

### User Story Dependencies

- **User Story 1 (P1)**: Requires Phase 2 — creates `NoteInput` component
- **User Story 2 (P2)**: Requires Phase 2 + `NoteInput` from US1 (T007) — reuses the component
- **User Story 3 (P3)**: Requires Phase 2 only — no dependency on US1 or US2 components

### Within Each Phase

- T001 and T002 are parallel (different files)
- T003 depends on T001 + T002; T004 and T005 are parallel with each other (after T001)
- T006 depends on T004 + T005
- T007 depends on T003 (needs `updateNote` action)
- T008 depends on T006 + T007
- T009 and T010 depend on T007 (reuse NoteInput)
- T011 depends on T006 (notes in history data)

### Parallel Opportunities

- T001 + T002 (different files: schema vs validators)
- T004 + T005 (same file but independent functions — can be one commit)
- T011 (US3) can run in parallel with T009-T010 (US2) since they touch different parts of FastingTimer.tsx

---

## Parallel Example: Phase 1

```bash
# These can run in parallel (different files):
Task: "T001 — Add @db.VarChar(280) to prisma/schema.prisma + run migration"
Task: "T002 — Add noteSchema to src/lib/validators.ts"
```

## Parallel Example: Phase 2

```bash
# After T001 completes, these can run in parallel:
Task: "T004 — Update getActiveFast() in src/app/actions/fasting.ts"
Task: "T005 — Update getHistory() in src/app/actions/fasting.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T002)
2. Complete Phase 2: Foundational (T003-T006)
3. Complete Phase 3: User Story 1 (T007-T008)
4. **STOP and VALIDATE**: Start a fast, add a note, verify blur-save, refresh, confirm persistence
5. Deploy/demo if ready — core notes feature is usable

### Incremental Delivery

1. Setup + Foundational → Data layer ready
2. Add User Story 1 → Note input on active fast screen (MVP!)
3. Add User Story 2 → Note editing in session detail modal
4. Add User Story 3 → Note previews in history list
5. Polish → Edge case validation and build check

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- No test tasks generated (no test framework configured per plan.md)
- `NoteInput` is the only new file; all other changes are modifications to existing files
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
