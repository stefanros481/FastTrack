# Feature Specification: Dashboard — History

**Feature Branch**: `006-dashboard-history`
**Created**: 2026-02-26
**Status**: Draft
**Input**: User description: "Implement EPIC 06 — Dashboard History. Paginated, chronological list of completed fasting sessions. Each entry is tappable to open the session detail/edit modal. Users can delete sessions."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Fasting History (Priority: P1)

As a user, I want to see a chronological list of all my past fasting sessions so that I can review my fasting habits and track my progress over time.

**Why this priority**: This is the core value of the history feature. Without being able to see past sessions, no other history-related interaction (detail view, delete) is possible. It transforms raw data into a reviewable record of the user's fasting journey.

**Independent Test**: Can be fully tested by completing several fasts and navigating to the history view. Verify that all completed sessions appear in reverse chronological order with correct data displayed on each card. Delivers the core value of habit review.

**Acceptance Scenarios**:

1. **Given** the user has completed fasting sessions, **When** they navigate to the history view (Log tab), **Then** they see a list of session cards sorted newest first.
2. **Given** the user has completed sessions, **When** they view a session card, **Then** it displays: date, start time, end time, duration, goal (if set), note preview (if present), and goal-met indicator.
3. **Given** the user has more than 20 completed sessions, **When** they view the history, **Then** only the first 20 sessions load initially.
4. **Given** the user has scrolled to the bottom of the currently loaded sessions, **When** more sessions exist, **Then** the next page of 20 sessions loads automatically (infinite scroll).
5. **Given** the history is loading, **When** the user views the list, **Then** placeholder skeleton cards are shown matching the session card dimensions.
6. **Given** the user has no completed sessions, **When** they navigate to history, **Then** they see an empty state message (e.g., an icon and "No fasting sessions yet").
7. **Given** session cards are appearing on screen, **When** they render, **Then** they animate in with a staggered slide-up entrance animation.

---

### User Story 2 - View Session Details (Priority: P1)

As a user, I want to tap on a session in my history to see its full details and edit it, so that I can review or correct my fasting records.

**Why this priority**: Viewing details completes the history browsing experience. Users need to see more than the card summary — full timestamps, notes, and the ability to edit. This leverages the existing session detail/edit modal.

**Independent Test**: Can be tested by tapping any session card in the history list and verifying the detail modal opens with the correct session data, including editable fields. Delivers review and correction value.

**Acceptance Scenarios**:

1. **Given** the user is viewing the history list, **When** they tap a session card, **Then** a session detail modal opens showing the full session information.
2. **Given** the session detail modal is open, **When** the user views the modal, **Then** they see: full date and time range, total duration, goal duration (if set), goal-met status, and notes.
3. **Given** the session detail modal is open, **When** the user edits the start time, end time, or notes, **Then** the changes are saved and reflected in the history list upon closing the modal.
4. **Given** the session detail modal is open, **When** the user taps outside the modal or presses a close button, **Then** the modal closes and the history list is visible.

---

### User Story 3 - Delete a Session (Priority: P2)

As a user, I want to delete a fasting session that was logged by mistake so that my history only contains accurate records.

**Why this priority**: Delete is a data management action that prevents incorrect records from polluting the user's history. It's lower priority than viewing because it's a corrective action rather than a primary workflow, but still essential for data integrity.

**Independent Test**: Can be tested by opening a session's detail modal, tapping delete, confirming the deletion, and verifying the session is removed from the history list and all related data (stats, charts) updates accordingly. Delivers data accuracy value.

**Acceptance Scenarios**:

1. **Given** the user has the session detail modal open, **When** they view the modal, **Then** they see a delete option at the bottom of the modal.
2. **Given** the user taps the delete button, **When** the confirmation prompt appears, **Then** it asks "Delete this session? This cannot be undone." with Confirm and Cancel options.
3. **Given** the user confirms deletion, **When** the action completes, **Then** the session is permanently removed from the system.
4. **Given** the user confirms deletion, **When** the modal closes, **Then** the history list updates to no longer show the deleted session.
5. **Given** the user confirms deletion, **When** other views reflect session data (stats, charts), **Then** those views recalculate to exclude the deleted session.
6. **Given** the user taps Cancel on the confirmation prompt, **When** the prompt closes, **Then** the session remains unchanged and the detail modal stays open.

---

### Edge Cases

- What happens when the user deletes the only session in their history? The list transitions to the empty state ("No fasting sessions yet").
- What happens when the user scrolls rapidly through many pages of history? The system handles concurrent page requests gracefully, avoiding duplicate entries or skipped sessions.
- What happens if a session has no end time (still active)? Active sessions are excluded from the history list entirely — only completed sessions appear.
- What happens if the user deletes a session while offline or with a network error? The system shows an error message and the session remains in the list unchanged.
- What happens when the user has exactly 20 sessions? No "load more" trigger fires since there are no additional pages.
- What happens if two browser tabs are open and a session is deleted in one? The other tab continues to show stale data until refreshed — no real-time sync is required for a single-user app.
- What happens when a session has a very long note (280 characters)? The card shows a truncated preview; the full note is visible in the detail modal.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display completed fasting sessions in a chronological list, sorted newest first.
- **FR-002**: Each session card MUST display: date, start time, end time, duration, goal duration (if set), note preview (if present), and goal-met indicator.
- **FR-003**: System MUST paginate the history list with 20 sessions per page using cursor-based pagination.
- **FR-004**: System MUST load additional pages automatically when the user scrolls to the bottom of the current page (infinite scroll).
- **FR-005**: System MUST display placeholder skeleton cards while session data is loading.
- **FR-006**: System MUST display an empty state with an icon and message when no completed sessions exist.
- **FR-007**: System MUST animate session cards with a staggered slide-up entrance animation on initial load and page transitions.
- **FR-008**: System MUST open a session detail modal when a session card is tapped.
- **FR-009**: The session detail modal MUST display full session information: date, start/end times, total duration, goal (if set), goal-met status, and notes.
- **FR-010**: The session detail modal MUST allow editing of start time, end time, and notes (leveraging existing edit functionality).
- **FR-011**: System MUST provide a delete button in the session detail modal.
- **FR-012**: System MUST show a confirmation prompt before deleting a session with the text "Delete this session? This cannot be undone."
- **FR-013**: System MUST permanently remove the session from the system upon confirmed deletion.
- **FR-014**: System MUST update the history list, statistics, and any related views after a session is deleted.
- **FR-015**: System MUST exclude active (in-progress) sessions from the history list.
- **FR-016**: System MUST truncate note previews on session cards to a single line.
- **FR-017**: The goal-met indicator MUST visually distinguish between "goal met" (success styling) and "goal not met" (muted styling).
- **FR-018**: System MUST display an error message if a delete operation fails, leaving the session unchanged.

### Key Entities

- **Fasting Session**: A completed fasting period with a start time and end time. Key attributes: unique identifier, start time, end time, goal duration (optional, in minutes), notes (optional, up to 280 characters), creation timestamp. Sessions appear in the history only when both start and end times are present.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can browse their full fasting history with no hard cap on total sessions viewable (pagination loads all records progressively).
- **SC-002**: Each page of 20 sessions loads in under 2 seconds on a standard mobile connection.
- **SC-003**: Users can open a session's detail modal in under 1 tap from the history list.
- **SC-004**: Users can delete a session in 3 taps or fewer (tap card → tap delete → confirm).
- **SC-005**: After deletion, the history list and related data views update within 2 seconds without requiring a manual page refresh.
- **SC-006**: The empty state is displayed immediately (no loading delay) when no sessions exist.
- **SC-007**: Skeleton loading placeholders appear within 200ms of navigating to the history view, providing immediate visual feedback.

## Assumptions

- The history view will continue to live within the existing "Log" tab of the main app rather than a separate `/dashboard` route. The epic references `/dashboard/page.tsx` as a key file, but the current architecture uses a single-page tabbed layout. This spec assumes the history remains accessible via the Log tab with the pagination upgrade applied in-place.
- The existing session detail/edit modal (`SessionDetailModal`) will be extended with delete functionality rather than building a separate detail component.
- Cursor-based pagination will use the session's creation timestamp or unique identifier as the cursor, ensuring stable ordering even as new sessions are added.
- Infinite scroll is the pagination UX pattern (not "Load More" button or numbered pages), matching mobile-first conventions.
- Session entrance animations respect `prefers-reduced-motion` using the `motion-safe:` prefix, consistent with the project's animation conventions.
- Deleting a session is a hard delete (permanent removal), not a soft delete. There is no undo or trash functionality.
- The existing `getHistory()` function (currently capped at 50 sessions with no cursor) will need to be replaced with a paginated data-fetching approach.
