# Tasks: ShadCN 24-Hour Date & Time Picker

**Input**: Design documents from `/specs/001-shadcn-datetime-picker/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, quickstart.md ✅

**Tests**: No automated tests — manual verification per quickstart.md (no test suite in project).

**Organization**: Tasks grouped by user story. US1 (Start Time) and US2 (End Time) share the same component — implementing US1 automatically delivers US2.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Add the one missing ShadCN component before implementation begins.

- [X] T001 Run `bunx shadcn add scroll-area` to generate `src/components/ui/scroll-area.tsx`

**Checkpoint**: `src/components/ui/scroll-area.tsx` exists and exports `ScrollArea` and `ScrollBar`.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: No additional foundational work needed — `Calendar`, `Popover`, and `Button` components are already present; `ScrollArea` is added in Phase 1. Implementation can begin immediately after T001.

**⚠️ CRITICAL**: T001 must be complete before any Phase 3 tasks begin.

---

## Phase 3: User Story 1 — Edit Session Start Time (Priority: P1) 🎯 MVP

**Goal**: Replace the plain calendar + number inputs picker in the Start Time field with the ShadCN 24h picker: single popover with calendar + scrollable hour/minute columns.

**Independent Test**: Open Session Details modal → tap Start Time field → popover shows calendar + two scroll columns → select date, hour, minute → trigger shows "Feb 25, 2026 18:00" format → tap away → field retains value → Save → session updates. (Full flow per `quickstart.md`.)

### Implementation for User Story 1

- [X] T002 [US1] Update imports in `src/components/ui/date-time-picker.tsx`: keep `CalendarIcon` from `lucide-react` (already correct — do NOT change this), remove the `Clock` import, add `import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"`, remove the `Popover`/`PopoverContent`/`PopoverTrigger` split imports if present and ensure they come from `@/components/ui/popover`
- [X] T003 [US1] Rewrite component signature and state in `src/components/ui/date-time-picker.tsx`: remove `calendarOpen`/`timeOpen` states, add single `isOpen` boolean state; keep `value`, `onChange`, `error`, `id` props unchanged
- [X] T004 [US1] Implement trigger button in `src/components/ui/date-time-picker.tsx`: full-width `Button variant="outline"` with `CalendarIcon`, displaying `format(value, "MMM d, yyyy HH:mm")` (e.g. "Feb 25, 2026 18:00"); apply `border-red-500` when `error` prop is true; meets `min-h-11` touch target
- [X] T005 [US1] Implement `handleDateSelect` and `handleTimeChange` helpers in `src/components/ui/date-time-picker.tsx`: `handleDateSelect` merges chosen calendar date with current `value.getHours()` / `value.getMinutes()`; `handleTimeChange` creates new Date from `value` with updated hour or minute; both call `onChange` with the new Date — **IMPORTANT: neither handler must call `setIsOpen(false)`; the popover stays open after every selection (FR-005)**
- [X] T006 [US1] Implement popover content layout in `src/components/ui/date-time-picker.tsx`: `<div className="sm:flex">` wrapping `<Calendar mode="single" selected={value} onSelect={handleDateSelect} />` on the left and a `<div className="flex flex-col sm:flex-row sm:h-[300px] divide-y sm:divide-y-0 sm:divide-x">` on the right for the two scroll columns
- [X] T007 [US1] Implement hours scroll column in `src/components/ui/date-time-picker.tsx`: `ScrollArea` containing 24 `Button` elements for hours 0–23 (rendered in reverse order); selected hour (`value.getHours()`) uses `variant="default"`, others use `variant="ghost"`; each button calls `handleTimeChange("hour", hour.toString())`; buttons use `size="icon"` and `className="sm:w-full shrink-0 aspect-square min-h-11 min-w-11"`
- [X] T008 [US1] Implement minutes scroll column in `src/components/ui/date-time-picker.tsx`: `ScrollArea` containing 12 `Button` elements for minutes `[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]`; selected minute uses snapping `Math.floor(value.getMinutes() / 5) * 5` to determine highlighted button; each button calls `handleTimeChange("minute", minute.toString())`; minute labels zero-padded (`padStart(2, '0')`); same sizing as hours
- [X] T009 [US1] Add scroll-into-view for selected hour and minute in `src/components/ui/date-time-picker.tsx` using **refs** (not `document.querySelector` — both pickers render simultaneously in the modal and a global DOM query would target the wrong instance): declare `hourRef = useRef<HTMLButtonElement>(null)` and `minuteRef = useRef<HTMLButtonElement>(null)`; attach `ref={hourRef}` to the currently-selected hour button in T007 and `ref={minuteRef}` to the currently-selected minute button in T008; add `useEffect(() => { if (isOpen) { hourRef.current?.scrollIntoView({ block: "center" }); minuteRef.current?.scrollIntoView({ block: "center" }); } }, [isOpen])`

**Checkpoint**: Start Time field works end-to-end — popover opens, pre-selects current values, calendar and columns update on interaction, trigger displays "Feb 25, 2026 18:00" style, value propagates to `onChange`, validation still works.

---

## Phase 4: User Story 2 — Edit Session End Time (Priority: P1)

**Goal**: Confirm the End Time field works identically to Start Time — no additional code changes needed since both use the same `DateTimePicker` component.

**Independent Test**: Open Session Details modal → tap End Time field → same picker behavior → select a time after start time → Save → session end time updates and duration recalculates.

### Implementation for User Story 2

- [X] T010 [US2] Verify `src/components/SessionDetailModal.tsx` End Time field renders correctly with the new component — confirm no import changes needed (interface unchanged: `value={endDate}`, `onChange={setEndDate}`, `error={!!errors.endedAt}`)
- [X] T011 [US2] Manual test: set End Time to a value before Start Time → confirm inline validation error appears and Save is disabled; set End Time after Start Time → confirm Save enables

**Checkpoint**: Both Start Time and End Time fields work independently and together. Duration calculation correct after save.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Final verification and cleanup.

- [X] T012 Remove unused imports from `src/components/ui/date-time-picker.tsx` (e.g. `padTwo`, `clamp` helpers from original implementation if still present)
- [X] T013 [P] Verify picker renders without horizontal overflow at 390 px viewport width (Chrome DevTools mobile simulation — iPhone 14 reference)
- [X] T014 [P] Verify `ScrollBar orientation="horizontal"` is present on each `ScrollArea` and hidden on `sm:` breakpoint (matches reference implementation: `className="sm:hidden"`)
- [X] T015 Run `bun run dev` and complete full quickstart.md checklist: open modal, edit start time, edit end time, save, confirm session updates in history list

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — run immediately
- **Foundational (Phase 2)**: Skipped — no additional prereqs
- **User Story 1 (Phase 3)**: Depends on T001 (ScrollArea) — BLOCKS Phase 3 start
- **User Story 2 (Phase 4)**: Depends on Phase 3 completion (same component)
- **Polish (Phase 5)**: Depends on Phase 3 + Phase 4

### Within Phase 3 (US1) — Sequential Order

```
T001 (setup) → T002 (imports) → T003 (state/props) → T004 (trigger) → T005 (handlers)
  → T006 (layout) → T007 (hours column) → T008 (minutes column) → T009 (scroll-into-view)
```

T002–T005 can be done in a single edit pass since they all modify the same file. T006–T009 build the JSX layer by layer.

### Parallel Opportunities

- T013 and T014 (Polish) can run in parallel — both are read-only verification tasks
- US2 verification tasks T010 and T011 can run in parallel after Phase 3

---

## Parallel Example: Phase 3 US1 (single developer)

```
# Sequential — all in one file:
T002 → T003 → T004 → T005 → T006 → T007 → T008 → T009
# Commit once after T009 (full component implemented)
```

---

## Implementation Strategy

### MVP (User Story 1 Only)

1. Complete T001 (ScrollArea install)
2. Complete T002–T009 (full DateTimePicker rewrite)
3. **STOP and VALIDATE**: Test Start Time field manually
4. If working: proceed to Phase 4 (End Time verification — no code needed)

### Incremental Delivery

Since both user stories share one component, this feature is a single atomic delivery:

1. T001 → T002–T009 → verify Start Time works
2. T010–T011 → verify End Time works (free — same component)
3. T012–T015 → polish and sign off

Total implementation: ~2 files changed (`date-time-picker.tsx` rewrite + `scroll-area.tsx` new).

---

## Notes

- [P] tasks = can run in parallel (different concerns, no shared file conflicts)
- All implementation tasks (T002–T009) touch only `src/components/ui/date-time-picker.tsx`
- `src/components/SessionDetailModal.tsx` is **never modified** — interface is unchanged
- Commit after T009 (implementation complete), then again after T015 (verified)
