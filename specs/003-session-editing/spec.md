# Feature Specification: Session Editing

**Feature Branch**: `003-session-editing`
**Created**: 2026-02-26
**Status**: Draft
**Input**: User description: "Session editing - allow users to correct start/end times of completed fasting sessions (Epic 03)"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Edit Start Time of a Completed Session (Priority: P1)

As a user, I want to edit the start time of a completed fasting session so that I can correct it when I forgot to tap "Start" on time.

**Why this priority**: Correcting the start time is the most common editing need — users often start fasting before remembering to open the app. Without this, session data is inaccurate and stats become unreliable.

**Independent Test**: Can be fully tested by tapping a completed session in the history list, changing the start time, saving, and verifying the updated duration and time are reflected in history and stats.

**Acceptance Scenarios**:

1. **Given** I have a completed session in my history, **When** I tap on that session, **Then** a detail modal opens showing the session's start time, end time, and duration.
2. **Given** the detail modal is open, **When** I tap the start time field, **Then** a date/time picker appears pre-filled with the current start time.
3. **Given** I have selected a new valid start time, **When** I tap "Save", **Then** the session is updated and the modal shows the recalculated duration.
4. **Given** I edit the start time to be after the end time, **When** the validation runs, **Then** I see an inline error "Start time must be before end time" and the Save button is disabled.

---

### User Story 2 - Edit End Time of a Completed Session (Priority: P1)

As a user, I want to edit the end time of a completed fasting session so that I can correct it when I forgot to tap "Stop" on time.

**Why this priority**: Equally important as editing start time — users often end their fast before tapping "Stop". Same core value: accurate session data.

**Independent Test**: Can be fully tested by tapping a completed session, changing the end time, saving, and verifying the updated duration is reflected.

**Acceptance Scenarios**:

1. **Given** the detail modal is open, **When** I tap the end time field, **Then** a date/time picker appears pre-filled with the current end time.
2. **Given** I have selected a new valid end time, **When** I tap "Save", **Then** the session is updated with the new end time and recalculated duration.
3. **Given** I edit the end time to be before the start time, **When** the validation runs, **Then** I see an inline error "Start time must be before end time" and the Save button is disabled.

---

### User Story 3 - Overlap Validation (Priority: P2)

As a user, I want the system to prevent me from saving times that overlap with another session so that my fasting history remains consistent and accurate.

**Why this priority**: Important for data integrity but less frequently encountered than basic time corrections. Most users only have one session per day.

**Independent Test**: Can be tested by editing a session's times to overlap with an adjacent session and verifying the error message appears.

**Acceptance Scenarios**:

1. **Given** I have two completed sessions (Session A: 8am-4pm, Session B: 8pm-8am), **When** I edit Session A's end time to 9pm (overlapping Session B), **Then** I see an inline error "This overlaps with another session" and the Save button is disabled.
2. **Given** I have corrected the overlapping time to a valid value, **When** the validation re-runs, **Then** the error disappears and the Save button becomes enabled.

---

### Edge Cases

- What happens when a user tries to set a start or end time in the future? The system prevents both start and end times that are after the current time.
- What happens when a user edits times on their only session? Overlap validation is skipped since there are no adjacent sessions.
- What happens if the user dismisses the modal without saving? Changes are discarded; the original session data is preserved.
- What happens if a network error occurs during save? The user sees a generic error message and can retry.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display a detail modal when a user taps a completed session in the history list.
- **FR-002**: The detail modal MUST show the session's start time, end time, calculated duration, protocol name, and goal status.
- **FR-003**: Users MUST be able to tap the start time field to open a date/time picker pre-filled with the current start time.
- **FR-004**: Users MUST be able to tap the end time field to open a date/time picker pre-filled with the current end time.
- **FR-005**: System MUST validate that the start time is before the end time (client-side for immediate feedback, server-side for security).
- **FR-006**: System MUST validate that edited times do not overlap with any other existing session for the same user (server-side, with error surfaced to client).
- **FR-007**: System MUST display inline error messages directly below the offending field when validation fails.
- **FR-008**: The Save button MUST be disabled while any validation error is present.
- **FR-009**: System MUST recalculate and display the updated duration when either time is changed (before saving).
- **FR-010**: System MUST persist updated times and recalculated duration when the user saves.
- **FR-011**: System MUST prevent setting a start time or end time in the future (after current time).
- **FR-012**: Dismissing the modal without saving MUST discard all unsaved changes.

### Key Entities

- **Fasting Session**: Represents a completed fast. Key attributes: start time, end time, duration, fasting protocol/goal, associated user. A user's sessions must not overlap in time.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can open a session detail modal and edit start or end time in under 10 seconds.
- **SC-002**: Validation errors appear instantly (within 500ms) after the user selects an invalid time.
- **SC-003**: Saving an edited session completes within 2 seconds and immediately reflects in the history list.
- **SC-004**: 100% of invalid time combinations (end before start, overlapping sessions, future start/end times) are caught and clearly communicated before save.

## Clarifications

### Session 2026-02-26

- Q: Should the end time also be constrained to not exceed the current time? → A: Yes — end time must also be in the past, since only completed sessions are edited.

## Assumptions

- This feature applies only to **completed** sessions (not active/in-progress fasts).
- The detail modal is accessed from the existing history list in the "Log" tab.
- Native HTML date/time inputs are used for the picker (no third-party date picker library needed).
- The single-user nature of FastTrack means overlap validation only checks against the same user's sessions.
- Duration is always derived from start and end times (not independently editable).
