# Tasks: Spinning Wheel Date/Time Picker

**Input**: Design documents from `/specs/011-spinning-wheel-picker/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: Install dependency and create shared wheel picker components

- [X] T001 Install `@ncdai/react-wheel-picker` package via `bun add @ncdai/react-wheel-picker`
- [X] T002 Create `WheelDateTimePicker` component with bottom sheet overlay, 3 drums (month/day covering past 90 days through today, hour, minute), confirm/cancel buttons, light/dark theme support using design tokens, and `maxDate` constraint in `src/components/ui/wheel-date-time-picker.tsx`
- [X] T003 Create `WheelTimePicker` component with bottom sheet overlay, 2 drums (hour 00–23, minute 00–59), confirm/cancel buttons, and light/dark theme support in `src/components/ui/wheel-time-picker.tsx`

**Checkpoint**: Both wheel picker components exist and can be imported. Bottom sheets use existing `animate-slide-up` animation.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Add server action and validation for active session start time editing (needed by US2, shared concern)

- [X] T004 Add `activeStartTimeSchema` Zod validation schema (startedAt must be in the past) in `src/lib/validators.ts`
- [X] T005 Add `updateActiveStartTime` server action in `src/app/actions/fasting.ts` — validates auth, verifies session is active (endedAt IS NULL), validates new startedAt is in the past and doesn't overlap with previous sessions, updates startedAt, and calls revalidatePath

**Checkpoint**: Server action ready. All user stories can proceed.

---

## Phase 3: User Story 1 - Edit completed session times with spinning wheel (Priority: P1)

**Goal**: Replace the popover calendar + number input date/time picker in SessionDetailModal with the spinning wheel bottom sheet picker.

**Independent Test**: Open a completed session from history, tap start or end time, verify spinning wheel appears with correct pre-selection, change a time, confirm, and verify duration recalculates.

### Implementation for User Story 1

- [X] T006 [US1] Replace `DateTimePicker` usage for start time with `WheelDateTimePicker` in `src/components/SessionDetailModal.tsx` — tap the start time field to open bottom sheet, pre-select current startDate, update on confirm
- [X] T007 [US1] Replace `DateTimePicker` usage for end time with `WheelDateTimePicker` in `src/components/SessionDetailModal.tsx` — tap the end time field to open bottom sheet, pre-select current endDate, update on confirm
- [X] T008 [US1] Remove `DateTimePicker` import and the old `src/components/ui/date-time-picker.tsx` component (and its Calendar/Popover dependencies if no longer used elsewhere)

**Checkpoint**: Session editing uses spinning wheel pickers. Duration recalculates on change. All existing validation still applies.

---

## Phase 4: User Story 2 - Edit active session start time with spinning wheel (Priority: P2)

**Goal**: Make the "Started" time display on the active fast screen tappable, opening a spinning wheel picker to adjust the start time.

**Independent Test**: Start a fast, tap the start time, adjust via wheel (back-date by 2 hours), confirm, and verify elapsed timer recalculates.

### Implementation for User Story 2

- [X] T009 [US2] Make the "Started [time]" text tappable in the active fast view in `src/components/FastingTimer.tsx` — add onClick handler to open WheelDateTimePicker with `maxDate` set to current time
- [X] T010 [US2] Wire the WheelDateTimePicker confirm action in `src/components/FastingTimer.tsx` — client-side `activeStartTimeSchema.safeParse()` validation before calling `updateActiveStartTime` server action, update local state, and recalculate elapsed timer

**Checkpoint**: Active session start time is editable via spinning wheel. Future times are blocked. Timer updates correctly.

---

## Phase 5: User Story 3 - Set notification reminder time with spinning wheel (Priority: P3)

**Goal**: Replace the native `<input type="time">` in notification settings with the spinning wheel time picker.

**Independent Test**: Go to Settings > Notifications, enable reminder, tap time field, verify spinning wheel appears, select 07:30, confirm, and verify time persists.

### Implementation for User Story 3

- [X] T011 [US3] Replace `<input type="time">` with `WheelTimePicker` in `src/components/NotificationSettings.tsx` — tap the time display to open bottom sheet, pre-select current time, update on confirm with HH:MM string format

**Checkpoint**: Notification time picker uses spinning wheel. Time persists correctly.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Cleanup, verification, and documentation

- [X] T012 Run TypeScript type check (`bunx tsc --noEmit`) and fix any type errors
- [X] T013 Verify all 3 picker integrations work in both light and dark mode themes
- [X] T014 Update CLAUDE.md with spinning wheel picker section documenting new components and dependencies

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — install package and create components
- **Foundational (Phase 2)**: Depends on Setup — adds server action needed by US2
- **US1 (Phase 3)**: Depends on Phase 1 (needs WheelDateTimePicker component)
- **US2 (Phase 4)**: Depends on Phase 1 + Phase 2 (needs component + server action)
- **US3 (Phase 5)**: Depends on Phase 1 (needs WheelTimePicker component)
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (P1)**: Depends only on Phase 1 setup
- **US2 (P2)**: Depends on Phase 1 + Phase 2 (server action)
- **US3 (P3)**: Depends only on Phase 1 setup — can run in parallel with US1

### Parallel Opportunities

- T002 and T003 can run in parallel (different files)
- T004 and T005 are sequential (schema before action)
- T006 and T007 are sequential (same file)
- US1 and US3 can run in parallel after Phase 1 (different files)
- US2 requires Phase 2 completion

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Install package + create both picker components
2. Complete Phase 3: Replace SessionDetailModal pickers
3. **STOP and VALIDATE**: Test session editing with new wheel pickers
4. Deploy if ready

### Incremental Delivery

1. Phase 1 → Components ready
2. Phase 2 → Server action ready
3. US1 → Session editing with wheels → Validate
4. US2 → Active session start time editing → Validate
5. US3 → Notification time picker → Validate
6. Polish → Type check, theme verification, docs

---

## Notes

- The old `src/components/ui/date-time-picker.tsx` can be deleted after T008 if no other consumers remain
- `src/components/ui/calendar.tsx` may also be removable if only used by the old date-time-picker — verify before deleting
- The `@ncdai/react-wheel-picker` library has zero production dependencies — no transitive dep concerns
- `visibleCount` prop must be a multiple of 4 (use 8 for compact display)
- Use `infinite: true` for hour and minute drums (wrap-around)
