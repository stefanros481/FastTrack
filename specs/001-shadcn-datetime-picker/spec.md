# Feature Specification: ShadCN 24-Hour Date & Time Picker

**Feature Branch**: `001-shadcn-datetime-picker`
**Created**: 2026-02-28
**Status**: Draft
**Input**: User description: "Replace the date and time picker in the session edit modal with the ShadCN 24-hour date and time picker component featuring a calendar popover with scrollable hour and minute columns."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Edit Session Start Time (Priority: P1)

A user taps the Start Time field in the Session Details modal and sees a single, unified popover showing a calendar alongside scrollable 24-hour and minute columns. They pick a date, scroll to the correct hour and minute, and the field updates immediately without closing the popover until they tap away.

**Why this priority**: This is the core interaction — replacing the current plain input-based picker with a polished, touch-friendly component directly addresses the request.

**Independent Test**: Open the Session Details modal, tap the Start Time field, choose a different date and time using the new picker, save — verify the session reflects the updated values.

**Acceptance Scenarios**:

1. **Given** a session edit modal is open, **When** the user taps the Start Time field, **Then** a popover opens showing a month calendar and two scrollable columns (hour 0–23, minute 00/05/…/55).
2. **Given** the picker popover is open, **When** the user selects a date on the calendar, **Then** the calendar highlights the selected date and the field's date portion updates.
3. **Given** the picker popover is open, **When** the user taps an hour button, **Then** that hour is visually highlighted and the field's time portion updates.
4. **Given** the picker popover is open, **When** the user taps a minute button, **Then** that minute is visually highlighted and the field's time portion updates.
5. **Given** valid date and time are selected, **When** the user closes the popover (taps outside), **Then** the field displays the chosen value in a readable 24-hour format (e.g. "Feb 25, 2026 18:00").
6. **Given** the session has an existing start time, **When** the picker opens, **Then** the calendar and scrollable columns are pre-populated with the current start time values.

---

### User Story 2 - Edit Session End Time (Priority: P1)

Same interaction as Story 1 but applied to the End Time field in the same modal.

**Why this priority**: Both Start and End Time fields use the same component; both must be replaced simultaneously to maintain visual consistency.

**Independent Test**: Tap the End Time field, change it to a later time, save — verify the session end time updates and the duration display recalculates.

**Acceptance Scenarios**:

1. **Given** a session edit modal is open, **When** the user taps the End Time field, **Then** the same 24-hour picker popover opens pre-populated with the current end time.
2. **Given** a new end time is selected that is after the start time, **When** the user saves, **Then** the session updates and the duration display reflects the new value.
3. **Given** a new end time is selected that is before or equal to the start time, **When** the field updates, **Then** an inline validation error is shown and the Save button is disabled.

---

### Edge Cases

- What happens if the user opens the picker but makes no change and closes it? The field retains its previous value unchanged.
- What if a stored minute value is not a multiple of 5 (e.g. 11:37)? The picker pre-selects the nearest displayed minute option (35) and that rounded value is persisted on save. 5-minute granularity is intentional and acceptable for a fasting tracker.
- What if the popover overflows the bottom of the mobile viewport? The popover should reposition or scroll to remain fully visible.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The Start Time and End Time fields in the Session Details modal MUST use the new ShadCN 24-hour date-time picker component.
- **FR-002**: The picker MUST display a single popover containing a month calendar and two scrollable columns: hours (0–23) and minutes (00, 05, 10, …, 55).
- **FR-003**: The picker MUST pre-populate with the field's current date and time when opened.
- **FR-004**: The currently selected hour and minute MUST be visually highlighted in their respective scroll columns.
- **FR-005**: Selecting a date, hour, or minute MUST immediately update the displayed field value without closing the popover.
- **FR-006**: The trigger button MUST display the selected date and time in the format "MMM d, yyyy HH:mm" (e.g. "Feb 25, 2026 18:00").
- **FR-007**: The component MUST expose a `value: Date` and `onChange: (date: Date) => void` interface to integrate with the existing validation and save logic without changes to those layers.
- **FR-008**: All existing validation rules (end time after start time, times in the past) MUST continue to work unchanged after the component replacement.
- **FR-009**: The picker MUST be fully usable on mobile viewport widths (375 px and above).

### Key Entities

- **DateTimePicker**: Reusable UI component wrapping the ShadCN calendar and scroll columns; accepts `value`, `onChange`, and optional `error` prop for error-state styling.
- **FastingSession (startedAt / endedAt)**: The date-time values being edited — unchanged in data model, only the editing UI changes.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can select any date and time combination in 3 interactions or fewer (one calendar tap, one hour tap, one minute tap).
- **SC-002**: The currently selected hour and minute are visible without additional scrolling when the picker opens (pre-scrolled into view).
- **SC-003**: The picker renders without horizontal overflow or clipping at 390 px viewport width (standard mobile reference).
- **SC-004**: All existing session-editing validation scenarios continue to pass after the component is replaced.
- **SC-005**: The field trigger displays the selected value in "Feb 25, 2026 18:00" style — month name, day, year, and 24-hour time.

## Clarifications

### Session 2026-02-28

- Q: Should the minute column use 5-minute increments (00, 05, …, 55) or 1-minute increments (00–59)? → A: 5-minute increments
- Q: What format should the trigger button display the selected date and time? → A: "Feb 25, 2026 18:00" (MMM d, yyyy HH:mm — month name + 24-hour time, matching existing app style)

## Assumptions

- `Calendar`, `Popover`, and `Button` ShadCN components are already present in the project. `ScrollArea` is not yet installed and will be added via `bunx shadcn add scroll-area` as the first implementation step.
- Minutes are offered in 5-minute increments (00, 05, 10, …, 55) — confirmed by user. Full 1-minute precision is not required.
- If `@radix-ui/react-icons` is not already installed, the existing `lucide-react` `CalendarIcon` is an acceptable substitute.
- The notification reminder time picker in the Settings page is out of scope — only the session edit modal is being changed.
- No database schema changes are required; only the UI component changes.
