# Feature Specification: Minimum Fasting Duration Enforcement

**Feature Branch**: `013-min-fasting-duration`
**Created**: 2026-03-03
**Status**: Draft
**Input**: User description: "We should add functionality not to allow any fasting sessions less than 12 hours. Propose a good way to implement that in the fasting track application."

## Clarifications

### Session 2026-03-03

- Q: How should sub-12h sessions be handled? → A: The long-press stop gesture works at any time. Before 12 hours, the ring label says "Cancel" and completing the long-press deletes the session (not saved to history). At 12 hours or more, the ring label says "End" and completing the long-press saves the session to history normally. One gesture, two outcomes based on duration.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - End or Cancel a Fast via Long-Press (Priority: P1)

The existing long-press stop gesture remains the single way to stop or cancel a fast. The behavior changes based on elapsed duration:
- **Before 12 hours**: The ring displays "Cancel" as its label. Completing the long-press deletes the session entirely — it is not saved to history. This lets users abandon a fast they can't complete.
- **At 12 hours or more**: The ring displays "End" as its label (current behavior). Completing the long-press ends the session and saves it to history normally.

No separate cancel button or confirmation dialog is needed — the ring label itself communicates the outcome.

**Why this priority**: This is the entire core of the feature. The single gesture handles both ending and cancelling, keeping the UX simple and familiar.

**Independent Test**: Can be tested by starting a fast, long-pressing before 12 hours and verifying the session is deleted, then starting another fast, waiting past 12 hours, and long-pressing to verify it's saved to history.

**Acceptance Scenarios**:

1. **Given** a user has an active fast started less than 12 hours ago, **When** viewing the timer screen, **Then** the long-press ring label says "Cancel" (instead of "End" or "Hold to end").
2. **Given** a user has an active fast started less than 12 hours ago, **When** the user completes the long-press gesture, **Then** the session is deleted from the database, does not appear in history, and the app returns to the "no active fast" state.
3. **Given** a user has an active fast started exactly 12 hours ago or more, **When** viewing the timer screen, **Then** the long-press ring label says "End" (current behavior).
4. **Given** a user has an active fast started 12 hours ago or more, **When** the user completes the long-press gesture, **Then** the session is saved to history normally (current behavior).
5. **Given** a user has an active fast at 11 hours and 59 minutes, **When** the 12-hour mark is reached while viewing the timer, **Then** the ring label transitions from "Cancel" to "End" without user interaction.

---

### User Story 2 - Prevent Editing a Completed Session Below 12 Hours (Priority: P2)

A user edits a completed session's start or end time in a way that would result in a duration shorter than 12 hours. The system rejects the edit and explains the minimum duration rule. This prevents users from circumventing the minimum by retroactively shortening sessions.

**Why this priority**: Editing is a secondary path — most users interact with the stop action. But this ensures consistency across all session modification paths.

**Independent Test**: Can be tested by opening a completed session, editing the start or end time to create a sub-12-hour duration, and attempting to save. The system should reject the change.

**Acceptance Scenarios**:

1. **Given** a completed session with a 14-hour duration, **When** the user edits the end time to reduce the duration to 10 hours and attempts to save, **Then** the system rejects the edit with a message stating the minimum 12-hour requirement.
2. **Given** a completed session with a 14-hour duration, **When** the user edits the start time forward to reduce the duration to 8 hours and attempts to save, **Then** the system rejects the edit with a message stating the minimum 12-hour requirement.
3. **Given** a completed session, **When** the user edits times such that the resulting duration is exactly 12 hours, **Then** the edit is accepted and saved.

---

### User Story 3 - Visual Indicator of Minimum Threshold on Active Fast (Priority: P3)

While a user has an active fast running, the interface subtly indicates whether the 12-hour minimum has been reached. The ring label change ("Cancel" vs "End") serves as the primary indicator, but additional visual cues reinforce the state.

**Why this priority**: This is a UX enhancement that improves discoverability of the rule but is not strictly required for enforcement.

**Independent Test**: Can be tested by starting a fast and observing the timer display before and after the 12-hour mark. A visual change should be apparent at the threshold.

**Acceptance Scenarios**:

1. **Given** a user has an active fast that has been running for less than 12 hours, **When** viewing the timer screen, **Then** the ring label and/or visual styling indicates the minimum has not been reached.
2. **Given** a user has an active fast that crosses the 12-hour mark while the user is viewing the timer, **When** the 12-hour threshold is reached, **Then** the visual indicator updates to show the minimum has been met.

---

### Edge Cases

- What happens if the user edits an active session's start time to a point more than 12 hours ago, then long-presses? The ring label should update to "End" and the session is saved to history.
- What happens if a user edits an active session's start time to a point less than 12 hours ago when it was previously more? The ring label should switch back to "Cancel".
- What happens to existing sessions in history that are shorter than 12 hours? They are preserved as-is (grandfather clause) — the rule applies only going forward.
- What happens if the user's device clock is wrong? The system uses server time for enforcement, so client-side display may differ slightly but the rule is enforced consistently.
- What happens if the user cancels a fast and immediately starts a new one? This is allowed — cancellation fully removes the previous session.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display "Cancel" as the long-press ring label when the elapsed duration is less than 12 hours (720 minutes).
- **FR-002**: System MUST display "End" as the long-press ring label when the elapsed duration is 12 hours or more (current behavior).
- **FR-003**: System MUST delete the active session (hard-delete) when the long-press is completed and elapsed duration is less than 12 hours — the session MUST NOT appear in history.
- **FR-004**: System MUST save the session to history normally when the long-press is completed and elapsed duration is 12 hours or more (current behavior).
- **FR-005**: System MUST enforce the 12-hour minimum duration when validating edits to completed sessions (both start and end time changes).
- **FR-006**: System MUST validate the minimum duration on the server side, regardless of any client-side checks.
- **FR-007**: System MUST NOT retroactively delete or modify existing sessions that are shorter than 12 hours.
- **FR-008**: System SHOULD provide a visual indicator on the active fast screen showing whether the 12-hour minimum has been reached.
- **FR-009**: System MUST use the session's `startedAt` timestamp (which may have been edited) as the basis for calculating elapsed duration.
- **FR-010**: System MUST transition the ring label from "Cancel" to "End" in real time when the 12-hour mark is reached during an active fast.

### Key Entities

- **FastingSession**: Existing entity — no schema changes required. The `startedAt` and `endedAt` fields are used to calculate duration. The 12-hour minimum is enforced as a business rule, not a database constraint. Cancelled sessions (sub-12h) are hard-deleted.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of fasting sessions in history going forward have a duration of 12 hours or longer.
- **SC-002**: Users can see whether their active fast will be saved or cancelled based on the ring label.
- **SC-003**: 100% of session edits that would result in a sub-12-hour duration are rejected with an appropriate error message.
- **SC-004**: Existing sessions shorter than 12 hours remain unchanged and visible in history.
