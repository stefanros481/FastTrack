# Feature Specification: Spinning Wheel Date/Time Picker

**Feature Branch**: `011-spinning-wheel-picker`
**Created**: 2026-02-27
**Status**: Draft
**Input**: User description: "Replace all date/time selectors with a mobile-style spinning wheel picker using a third-party library. Apply to session editing, notification time, and allow editing start time of an active session."

## User Scenarios & Testing

### User Story 1 - Edit completed session times with spinning wheel (Priority: P1)

When a user opens a completed fasting session from history and taps to edit the start or end time, they see a mobile-style spinning drum/wheel picker for selecting date and time instead of the current popover calendar + number inputs. The wheel scrolls smoothly with momentum and snaps to valid values.

**Why this priority**: This is the most frequently used date/time picker in the app — every session edit uses it. Replacing it delivers the biggest UX impact.

**Independent Test**: Open any completed session from history, tap the start or end time field, and verify the spinning wheel appears with smooth scrolling and correct value selection.

**Acceptance Scenarios**:

1. **Given** a user views a completed session detail, **When** they tap the start time field, **Then** a spinning wheel picker appears with day/month, hour, and minute drums pre-set to the current start time
2. **Given** the spinning wheel is open, **When** the user scrolls the hour drum from 14 to 09, **Then** the selected time updates to 09:XX and the duration recalculates live
3. **Given** the user has selected a new time via the wheel, **When** they confirm the selection, **Then** the session detail reflects the updated time immediately

---

### User Story 2 - Edit active session start time with spinning wheel (Priority: P2)

When a user has an active (in-progress) fast, they can tap the "Started" time display to open a spinning wheel picker and adjust when the fast started. This is useful when a user forgot to start the timer and wants to back-date it.

**Why this priority**: Users frequently forget to start their fast on time. Allowing start time correction for active sessions is a high-value feature that doesn't exist today.

**Independent Test**: Start a fast, tap the start time, adjust it via the spinning wheel, and verify the elapsed timer updates accordingly.

**Acceptance Scenarios**:

1. **Given** a user has an active fast, **When** they tap the displayed start time, **Then** a spinning wheel picker appears pre-set to the current start time
2. **Given** the spinning wheel is open for an active fast, **When** the user selects a time in the past (but not in the future), **Then** the start time updates and the elapsed timer recalculates
3. **Given** the spinning wheel is open for an active fast, **When** the user tries to select a time in the future, **Then** the picker does not allow selection beyond the current time

---

### User Story 3 - Set notification reminder time with spinning wheel (Priority: P3)

When a user enables the daily fasting reminder in Settings and taps the reminder time field, they see a spinning wheel picker for selecting hours and minutes instead of the native time input element. This provides a consistent experience across all platforms.

**Why this priority**: The notification time picker is used less frequently (one-time setup) but benefits from consistent UX with the other pickers.

**Independent Test**: Go to Settings > Notifications, enable the reminder, tap the time field, and verify the spinning wheel appears for hour/minute selection.

**Acceptance Scenarios**:

1. **Given** a user has enabled the daily reminder, **When** they tap the reminder time field, **Then** a spinning wheel picker appears with hour (00–23) and minute (00–59) drums
2. **Given** the spinning wheel is open, **When** the user scrolls to select 07:30, **Then** the reminder time updates to 07:30 and is persisted

---

### Edge Cases

- What happens when the user rapidly scrolls the wheel past boundaries (e.g., scrolling minutes past 59)? The wheel wraps around (59 to 00) or stops at the boundary, depending on the library's behavior.
- What happens on devices without touch support (desktop)? The wheel supports mouse drag/scroll and keyboard arrow keys.
- What happens when the picker is opened on a very small screen? The picker is full-width and takes up reasonable vertical space without overflowing.
- What happens when editing an active fast's start time and another device also has the app open? The server action validates the new start time; the other device sees the updated time on next page load.

## Clarifications

### Session 2026-02-27

- Q: How should the spinning wheel be presented — inline, bottom sheet, or modal? → A: Bottom sheet (slides up from bottom)

## Requirements

### Functional Requirements

- **FR-001**: System MUST replace the current date-time popover picker in session editing with a spinning wheel picker
- **FR-002**: System MUST replace the current native time input in notification settings with a spinning wheel time picker
- **FR-003**: System MUST allow users to edit the start time of an active (in-progress) fasting session
- **FR-004**: The spinning wheel picker MUST use a third-party library (not custom-built)
- **FR-005**: The spinning wheel MUST support smooth momentum scrolling and snap-to-value behavior
- **FR-006**: The spinning wheel MUST display pre-selected values when opened (current date/time)
- **FR-007**: The date/time picker MUST include drums for: month/day, hour, and minute at minimum
- **FR-008**: The time-only picker (notifications) MUST include drums for: hour and minute
- **FR-009**: Active session start time editing MUST NOT allow selecting a future time
- **FR-010**: All existing validation rules for session editing MUST continue to apply (start before end, not in future, etc.)
- **FR-011**: The picker MUST work on both touch devices (mobile) and pointer devices (desktop)
- **FR-012**: The picker MUST respect the app's light/dark theme
- **FR-013**: The picker MUST be presented as a bottom sheet overlay that slides up from the bottom of the screen

## Success Criteria

### Measurable Outcomes

- **SC-001**: Users can select a date and time using the spinning wheel in under 10 seconds
- **SC-002**: The spinning wheel picker renders and is interactive within 1 second of being opened
- **SC-003**: 100% of existing session editing flows continue to work correctly after the replacement
- **SC-004**: The picker is usable on screens as small as 320px wide

## Assumptions

- A suitable third-party spinning wheel library exists that supports theming and touch/mouse input
- The 24-hour time format will be used (consistent with existing app behavior)
- The existing session edit validation will be reused — only the UI input component changes
- The spinning wheel will be presented as a bottom sheet (slides up from the bottom of the screen as an overlay)
- For the date portion, the picker will show a combined month/day drum rather than separate month and day drums

## Out of Scope

- Replacing the fasting goal selector (pill buttons) — this is not a date/time picker
- Adding new database schema changes — this is primarily a UI change (the active session start time edit needs a server action but no schema changes)
- Calendar view for date selection — the spinning wheel replaces the calendar popover entirely
