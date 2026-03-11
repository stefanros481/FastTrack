# Tasks: Remove Reminder Functionality

**Input**: Design documents from `/specs/022-remove-reminders/`
**Prerequisites**: plan.md, spec.md, data-model.md, research.md

**Tests**: Not requested — manual verification only (build succeeds, settings page works).

**Organization**: Tasks grouped by user story. Note: US1 and US2 are tightly coupled (UI imports backend code), so they should be executed sequentially within a single pass. US3 (database) must come after US1+US2 since Prisma schema fields can only be removed after all code references are gone.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: User Story 2 - Clean Removal of Backend Logic (Priority: P2)

**Goal**: Remove all reminder-related server actions, validation schemas, and test code so no dead backend code remains.

**Independent Test**: Search codebase for `updateReminderSettings` and `reminderTimeSchema` — zero results. Application compiles.

**Why P2 first**: UI code (US1) imports backend functions. Removing backend code first prevents import errors during UI cleanup.

### Implementation for User Story 2

- [X] T001 [US2] Remove `updateReminderSettings` server action (lines 99–111) in src/app/actions/settings.ts
- [X] T002 [US2] Update `getNotificationSettings` to return only `maxDurationMinutes` (remove `reminderEnabled` and `reminderTime` from select, return type, and return object) in src/app/actions/settings.ts
- [X] T003 [P] [US2] Remove `reminderTimeSchema` export (lines 54–57) in src/lib/validators.ts
- [X] T004 [P] [US2] Remove `reminderTimeSchema` test block (describe block starting at line 205) in src/__tests__/lib/validators.test.ts

**Checkpoint**: Backend has zero reminder references. `getNotificationSettings` returns `{ maxDurationMinutes: number | null }` only.

---

## Phase 2: User Story 1 - Notifications Settings Without Reminder (Priority: P1)

**Goal**: Remove the Daily Reminder toggle and Reminder Time picker from the Settings page UI. Max Duration Alert remains fully functional.

**Independent Test**: Navigate to Settings → Notifications section shows only Max Duration Alert input. No reminder toggle or time picker visible.

### Implementation for User Story 1

- [X] T005 [US1] Rewrite NotificationSettings component to remove all reminder state, handlers, and UI (Daily Reminder toggle + Reminder Time picker); keep only Max Duration Alert in src/components/NotificationSettings.tsx
- [X] T006 [US1] Update settings page to pass only `maxDurationMinutes` prop to NotificationSettings (remove `reminderEnabled` and `reminderTime` props) in src/app/settings/page.tsx
- [X] T007 [P] [US1] Delete the WheelTimePicker component (only used by reminder time picker) at src/components/ui/wheel-time-picker.tsx
- [X] T008 [US1] Remove `updateReminderSettings` and `reminderTimeSchema` imports from NotificationSettings (already deleted in T001/T003, just ensure no stale imports) in src/components/NotificationSettings.tsx

**Checkpoint**: Settings page Notifications section shows only Max Duration Alert. No reminder UI visible. Application builds.

---

## Phase 3: User Story 3 - Database Schema Deprecation (Priority: P3)

**Goal**: Remove `reminderEnabled` and `reminderTime` fields from the UserSettings Prisma model and generate a migration to drop the columns.

**Independent Test**: Inspect `prisma/schema.prisma` — no `reminderEnabled` or `reminderTime` fields. Migration applies cleanly.

### Implementation for User Story 3

- [X] T009 [US3] Remove `reminderEnabled` and `reminderTime` field declarations from UserSettings model in prisma/schema.prisma
- [X] T010 [US3] Generate Prisma migration to drop the two columns by running `bunx prisma migrate dev --name remove-reminder-fields`
- [X] T011 [US3] Regenerate Prisma client to ensure types reflect the schema change by running `bunx prisma generate`

**Checkpoint**: Database schema no longer contains reminder fields. Prisma client types updated.

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: Final verification that everything works end-to-end.

- [X] T012 Verify application builds successfully by running `bun run build`
- [X] T013 Verify no remaining reminder references in source code (exclude migration files) by searching for `reminder` across src/ directory
- [X] T014 Update CLAUDE.md to remove references to reminder functionality in the Notifications Settings documentation

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (US2 — Backend)**: No dependencies — can start immediately
- **Phase 2 (US1 — UI)**: Depends on Phase 1 (backend imports must be removed before UI cleanup)
- **Phase 3 (US3 — Database)**: Depends on Phase 1 + Phase 2 (all code references to reminder fields must be removed before Prisma schema change)
- **Phase 4 (Polish)**: Depends on all previous phases

### Within Each Phase

- T001 before T002 (both modify same file: settings.ts)
- T003 and T004 can run in parallel with each other and with T001/T002 (different files)
- T005 before T008 (both modify NotificationSettings.tsx)
- T006 depends on T002 (settings page uses return type of getNotificationSettings)
- T007 can run in parallel with T005/T006 (different file)
- T009 before T010 before T011 (sequential Prisma workflow)

### Parallel Opportunities

```text
# Within Phase 1 (Backend):
Parallel: T003 (validators.ts) + T004 (validators.test.ts)
Sequential: T001 → T002 (same file: settings.ts)

# Within Phase 2 (UI):
Parallel: T007 (delete wheel-time-picker.tsx)
Sequential: T005 → T008 (same file: NotificationSettings.tsx)

# Phase 3 is fully sequential (Prisma workflow)
```

---

## Implementation Strategy

### MVP First (Recommended)

This is a small removal feature. All phases should be completed in a single pass:

1. Phase 1: Remove backend code (T001–T004)
2. Phase 2: Remove UI code (T005–T008)
3. Phase 3: Update database schema (T009–T011)
4. Phase 4: Verify build and clean up (T012–T014)

Total: **14 tasks**, single developer, single session.

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- T005 and T008 both touch NotificationSettings.tsx — in practice, do them as a single edit pass
- T007 is a file deletion, not an edit
- The `Switch` component import in NotificationSettings.tsx should be removed if it's only used by the reminder toggle
- After T010, review the generated migration SQL to confirm it only drops the two expected columns
