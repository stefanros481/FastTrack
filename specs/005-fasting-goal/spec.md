# Feature Specification: Fasting Goal

**Feature Branch**: `005-fasting-goal`
**Created**: 2026-02-26
**Status**: Draft
**Input**: User description: "Implement EPIC 05 — Fasting Goal. Users can set a target duration per session, view progress as a circular ring, receive a celebration animation and notification when the goal is reached, and configure a default goal in settings."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Set a Fasting Goal When Starting a Fast (Priority: P1)

As a user, I want to set a target duration when I start a fast so that I have a clear goal to work toward and can track my progress.

**Why this priority**: This is the foundational interaction — without the ability to set a goal, no other goal-related feature (progress, notifications, defaults) has meaning. It delivers immediate value by giving users intent and structure to their fasts.

**Independent Test**: Can be fully tested by starting a fast with a selected goal duration, verifying the goal is persisted, and confirming it appears in session history. Delivers the core value of goal-setting.

**Acceptance Scenarios**:

1. **Given** the user is on the start screen (no active fast), **When** they view the goal selection area, **Then** they see quick-select options for 12h, 16h, 18h, 20h, and 24h displayed as selectable pills.
2. **Given** the user is on the start screen, **When** they want a non-standard duration, **Then** they can enter a custom goal duration using a numeric input (in hours and minutes).
3. **Given** the user has selected a goal (quick-select or custom), **When** they start the fast, **Then** the goal duration is saved with the fasting session.
4. **Given** the user has a default goal configured in settings, **When** they open the start screen, **Then** the default goal is pre-selected.
5. **Given** the user has a pre-selected default goal, **When** they choose a different goal before starting, **Then** the newly selected goal overrides the default for this session only.
6. **Given** the user does not want a goal for this session, **When** they start the fast without selecting any goal, **Then** the session is started with no goal attached.

---

### User Story 2 - View Goal Progress During an Active Fast (Priority: P1)

As a user, I want to see my progress toward my fasting goal as a visual indicator so that I stay motivated throughout my fast.

**Why this priority**: Visual progress feedback is what transforms a simple timer into a goal-oriented experience. Without it, setting a goal has no visible payoff during the fast itself. This is co-equal with goal-setting as it completes the core loop.

**Independent Test**: Can be tested by starting a fast with a goal and observing the progress ring fill over time, verifying percentage accuracy and remaining time display. Delivers motivational value during an active fast.

**Acceptance Scenarios**:

1. **Given** the user has an active fast with a goal set, **When** they view the timer screen, **Then** they see a circular progress ring showing the percentage of the goal completed.
2. **Given** the user has an active fast with a goal, **When** time elapses, **Then** the ring progressively fills and the remaining time (e.g., "4h 23m to go") updates in real time.
3. **Given** the user has an active fast with a goal, **When** the elapsed time reaches 100% of the goal, **Then** the ring completes fully and changes color to indicate success.
4. **Given** the user has an active fast without a goal, **When** they view the timer screen, **Then** no progress ring or goal-related indicators are shown (standard timer display only).
5. **Given** the user has an active fast and the elapsed time exceeds the goal, **When** they view the timer, **Then** the ring remains at 100% and the display shows how much time has passed beyond the goal (e.g., "+1h 15m").

---

### User Story 3 - Celebrate Goal Completion (Priority: P2)

As a user, I want to see a celebration when I reach my fasting goal so that I feel rewarded and motivated to continue fasting with goals.

**Why this priority**: Celebration provides the emotional payoff for reaching a goal. While not strictly required for functionality, it significantly enhances user satisfaction and motivation. Depends on the progress ring (US-2) being in place.

**Independent Test**: Can be tested by starting a fast with a short goal duration, waiting for the goal to be reached, and observing the celebration animation and visual feedback. Delivers emotional reward.

**Acceptance Scenarios**:

1. **Given** the user has an active fast with a goal, **When** the elapsed time first reaches the goal duration, **Then** a celebration animation plays on the progress ring (e.g., a bounce-in checkmark).
2. **Given** the user has an active fast with a goal, **When** the goal is reached, **Then** the progress ring stroke color transitions from the primary color to a success color.
3. **Given** the user has reduced motion enabled in their OS, **When** the goal is reached, **Then** the celebration animation respects the `prefers-reduced-motion` setting (visual change without animation).

---

### User Story 4 - Receive Goal Notification (Priority: P2)

As a user, I want to be notified when I reach my fasting goal so that I know I can break my fast, even if the app is in the background.

**Why this priority**: Notifications extend goal tracking beyond the active screen. Users often start a fast and check back later. This ensures they don't miss their goal moment. Depends on US-2 for the elapsed-time tracking logic.

**Independent Test**: Can be tested by starting a fast with a goal, waiting for the elapsed time to reach the goal, and verifying that a browser notification fires (with in-app toast as fallback). Delivers awareness value.

**Acceptance Scenarios**:

1. **Given** the user has an active fast with a goal and has granted notification permission, **When** the elapsed time reaches the goal duration, **Then** a browser notification is sent with the message "You've reached your [X]h fasting goal!".
2. **Given** the user has an active fast with a goal and has NOT granted notification permission, **When** the goal is reached, **Then** an in-app toast notification appears as a fallback.
3. **Given** the user has already been notified about reaching the goal for this session, **When** the timer continues running, **Then** no additional notifications are sent for the same session.
4. **Given** the app is in the background or the browser tab is not focused, **When** the goal is reached, **Then** the browser notification still fires (if permission was granted).

---

### User Story 5 - Configure Default Goal in Settings (Priority: P3)

As a user, I want to set a default fasting goal in my settings so that I don't have to pick one every time I start a fast.

**Why this priority**: This is a convenience feature that reduces friction for repeat users. It depends on the goal-setting UI (US-1) being in place first. Lower priority because users can manually select a goal each time without this.

**Independent Test**: Can be tested by navigating to settings, selecting a default goal, returning to the start screen, and verifying the default is pre-filled. Delivers convenience value for repeat use.

**Acceptance Scenarios**:

1. **Given** the user navigates to the settings page, **When** they view the settings, **Then** they see a "Default fasting goal" option.
2. **Given** the user is on the settings page, **When** they select a default goal (from the same quick-select options: 12h, 16h, 18h, 20h, 24h, or custom), **Then** the selection is saved immediately.
3. **Given** the user has set a default goal, **When** they start a new fast, **Then** the default goal is pre-selected on the start screen.
4. **Given** the user has set a default goal, **When** they want to clear it, **Then** they can select "No default" to remove the default goal.
5. **Given** the user has no default goal set, **When** they navigate to settings, **Then** the default goal option shows "None" or equivalent.

---

### Edge Cases

- What happens when the user sets a custom goal of 0 minutes or a negative value? The system rejects it and shows a validation error. Minimum goal is 1 hour (60 minutes).
- What happens when the user enters an extremely long goal (e.g., 168 hours / 7 days)? The system caps the maximum goal at 72 hours (4,320 minutes) with a validation message.
- What happens if the user edits a completed session's goal after the fact? The goal-reached status recalculates based on the new goal vs. the actual session duration.
- What happens if the browser does not support the Notification API? The system falls back to in-app toast notifications only, with no error shown.
- What happens if the user starts a fast with a goal, then changes their device/browser? The goal is persisted server-side; on reload, the progress ring resumes from the stored goal and current elapsed time.
- What happens when the timer crosses the goal threshold while the app tab is inactive? The notification fires when the tab regains focus or via a background timer check, and the celebration plays when the user returns to the tab.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display quick-select goal options (12h, 16h, 18h, 20h, 24h) as selectable pills on the start screen.
- **FR-002**: System MUST allow users to enter a custom goal duration with a minimum of 1 hour and maximum of 72 hours.
- **FR-003**: System MUST persist the selected goal with the fasting session when a fast is started.
- **FR-004**: System MUST allow starting a fast without selecting a goal (goal is optional).
- **FR-005**: System MUST display a circular progress ring showing percentage toward the goal during an active fast with a goal set.
- **FR-006**: System MUST display remaining time (e.g., "4h 23m to go") below or inside the progress ring during an active fast with a goal.
- **FR-007**: System MUST update the progress ring and remaining time in real time as the fast progresses.
- **FR-008**: System MUST change the progress ring color from the primary color to the success color when the goal is reached.
- **FR-009**: System MUST play a celebration animation when the goal is first reached during a session.
- **FR-010**: System MUST respect `prefers-reduced-motion` for celebration animations (use `motion-safe:` prefix).
- **FR-011**: System MUST send a browser notification with the text "You've reached your [X]h fasting goal!" when the goal is reached (if notification permission is granted).
- **FR-012**: System MUST display an in-app toast notification as a fallback when browser notification permission is not granted.
- **FR-013**: System MUST send the goal notification only once per session (no repeated notifications).
- **FR-014**: System MUST provide a "Default fasting goal" setting on the settings page.
- **FR-015**: System MUST pre-fill the goal selection with the user's default goal when starting a new fast.
- **FR-016**: System MUST allow the user to override the default goal on a per-session basis.
- **FR-017**: System MUST allow the user to clear the default goal (set to "None").
- **FR-018**: System MUST show overtime display (e.g., "+1h 15m") when the elapsed time exceeds the goal.
- **FR-019**: System MUST validate custom goal input (minimum 1 hour, maximum 72 hours, numeric only).

### Key Entities

- **Fasting Session**: Represents a single fasting period. Key attributes: start time, end time, goal duration (optional, in minutes), notes. A session may or may not have a goal. If a goal is set, the session tracks progress toward it.
- **User Settings**: Per-user preferences that persist across sessions. Key attribute for this feature: default goal duration (optional, in minutes). When set, new sessions auto-fill with this goal.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can select a fasting goal and start a fast in under 10 seconds (goal selection adds no more than 2 taps to the start flow).
- **SC-002**: The progress ring updates smoothly in real time with no visible lag or jank during an active fast.
- **SC-003**: 100% of goal-reached events trigger exactly one notification (browser or in-app fallback) per session.
- **SC-004**: Users can configure a default goal in settings in under 15 seconds.
- **SC-005**: The default goal pre-fills correctly on 100% of new fast starts after being configured.
- **SC-006**: Goal progress visuals (ring, remaining time, overtime) display accurately within 1 second of real elapsed time.
- **SC-007**: Celebration animation plays within 1 second of the goal being reached, providing immediate visual feedback.

## Assumptions

- The existing protocol selector (16:8, 18:6, 20:4, 24h grid) will be replaced or augmented with the new goal pill selector (12h, 16h, 18h, 20h, 24h) to align with the epic's design. The quick-select options differ slightly from the current protocol grid.
- The `goalMinutes` field on `FastingSession` and `defaultGoalMinutes` on `UserSettings` already exist in the database schema and do not require migration.
- Browser Notification API permission will be requested at the point of goal notification (not proactively on app load). If denied, the in-app toast serves as the sole notification mechanism.
- The custom goal input accepts hours (with optional minutes), not raw minutes, to match user mental models for fasting durations.
- The settings page will need navigation access added (currently no link from the main app).
- The progress ring replaces or augments the existing fill-from-bottom progress animation when a goal is set.
