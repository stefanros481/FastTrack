# Feature Specification: Fasting Goal

**Feature Branch**: `005-fasting-goal`
**Created**: 2026-02-26
**Status**: Draft
**Input**: Epic 05 — Fasting Goal: goal setting, progress ring, goal-reached notification, and default goal in settings

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Set a Fasting Goal (Priority: P1) 🎯 MVP

A user starting a new fast can select a target duration for their session. Quick-select goal pills (12h, 16h, 18h, 20h, 24h) are presented as pill buttons. Where a pill corresponds to a known fasting protocol, a subtitle is shown (e.g., 16h → "Intermittent", 18h → "Advanced", 20h → "Warrior", 24h → "OMAD"). The 12h pill has no protocol subtitle. The user can also enter a custom duration in hours and minutes. If the user has previously saved a default goal in settings, that goal is automatically pre-selected when starting a new fast. The selected goal is saved with the fasting session.

**Why this priority**: Without goal setting, the remaining stories (progress ring, notifications) have nothing to track against. This is the foundational capability.

**Independent Test**: Start a new fast, select a goal duration from quick-select pills or enter a custom value, confirm the fast starts with the chosen goal recorded. Verify the default goal pre-fills if one is saved in settings.

**Acceptance Scenarios**:

1. **Given** the user is on the timer screen and not fasting, **When** they view the goal selector, **Then** they see quick-select pill buttons for 12h, 16h, 18h, 20h, and 24h.
2. **Given** the user has no default goal set, **When** they view the goal selector, **Then** no pill is pre-selected (the first protocol option is selected as currently implemented).
3. **Given** the user has a default goal of 16h saved in settings, **When** they view the goal selector, **Then** the 16h pill is pre-selected.
4. **Given** the user has a default goal that doesn't match any quick-select option (e.g., 14h), **When** they view the goal selector, **Then** the custom input is pre-filled with 14h.
5. **Given** the user selects a quick-select pill, **When** they start the fast, **Then** the session is created with the corresponding goal duration.
6. **Given** the user enters a custom duration (e.g., 15 hours 30 minutes), **When** they start the fast, **Then** the session is created with 930 minutes as the goal.
7. **Given** the user selects a goal and then changes their mind, **When** they select a different pill or modify the custom input, **Then** the new goal replaces the previous selection.

---

### User Story 2 — View Goal Progress Ring (Priority: P2)

While fasting with a goal set, the existing background fill animation is replaced by a circular progress ring as the hero visual element. The ring fills clockwise as time progresses. Inside the ring, the elapsed HH:MM:SS timer is displayed as the primary readout, with the percentage and remaining time ("Xh Ym to go") as secondary labels below it. This creates a single unified progress display. When the goal is reached, the ring completes fully and changes to a success color with a celebration animation.

**Why this priority**: The progress ring is the primary motivational element during a fast. It transforms raw elapsed time into meaningful, goal-oriented feedback.

**Independent Test**: Start a fast with a goal, observe the ring filling over time, verify the percentage and "time to go" label update. When goal time is reached, verify the ring turns green and the celebration animation plays.

**Acceptance Scenarios**:

1. **Given** the user is fasting with a goal set, **When** viewing the timer screen, **Then** a circular progress ring replaces the background fill animation, with the HH:MM:SS timer inside the ring, and percentage + remaining time below.
2. **Given** the user is fasting with a 16h goal and 8h have elapsed, **When** viewing the progress ring, **Then** the ring is approximately 50% filled, the elapsed timer shows inside the ring, and "50% · 8h 0m to go" is displayed below.
3. **Given** the user is fasting with a goal set, **When** the elapsed time increases, **Then** the ring smoothly animates to reflect the new percentage.
4. **Given** the user is fasting and reaches 100% of their goal, **When** the goal is reached, **Then** the ring changes to a success color and a celebration animation plays (respecting reduced-motion preferences).
5. **Given** the user is fasting past their goal (e.g., 18h elapsed on a 16h goal), **When** viewing the progress ring, **Then** the ring stays at 100% with the success color and shows "Goal reached!" instead of remaining time.
6. **Given** the user is fasting without a goal set, **When** viewing the timer screen, **Then** the existing timer card with background fill animation is shown (no progress ring).

---

### User Story 3 — Goal Reached Notification (Priority: P3)

When the user reaches their fasting goal, they receive a notification. If the browser supports notifications and permission has been granted, a browser notification is sent. If browser notifications are unavailable or denied, an in-app toast notification appears instead. The notification includes the goal duration in the message.

**Why this priority**: Notifications are valuable but secondary to the visual progress. Users actively watching the app will see the ring complete; notifications serve users who have the app in the background.

**Independent Test**: Start a fast with a short goal (or simulate elapsed time), wait for the goal to be reached, verify a browser notification fires (if permitted) and/or an in-app toast appears with the correct message.

**Acceptance Scenarios**:

1. **Given** the user is fasting with a 16h goal and browser notification permission is granted, **When** elapsed time reaches 16h, **Then** a browser notification appears with "You've reached your 16h fasting goal!"
2. **Given** the user is fasting with a goal and browser notifications are denied or unavailable, **When** the goal is reached, **Then** an in-app toast notification slides up with the same message, auto-dismisses after 5 seconds, and can be tapped to dismiss early.
3. **Given** the user has already been notified for this session's goal, **When** time continues to pass, **Then** no additional notifications are sent for the same session.
4. **Given** the app is in the background (browser tab not focused), **When** the goal is reached, **Then** the browser notification still fires (if permission granted).

---

### User Story 4 — Default Goal in Settings (Priority: P4)

The user can configure a default fasting goal on the settings page. When set, this default pre-fills the goal selector on new fasts. The user can override the default on any individual session. The default can be changed or cleared at any time.

**Why this priority**: This is a convenience feature that reduces friction for repeat users but is not essential for core goal-setting functionality.

**Independent Test**: Navigate to settings, set a default goal, go back to the timer, start a new fast, verify the goal selector is pre-filled with the saved default. Clear the default in settings and verify no pre-fill occurs.

**Acceptance Scenarios**:

1. **Given** the user is on the settings page, **When** they look at the settings options, **Then** they see a "Default fasting goal" option.
2. **Given** the user taps the default goal setting, **When** selecting a duration (same quick-select options: 12h, 16h, 18h, 20h, 24h, or custom), **Then** the default is saved and persisted across sessions.
3. **Given** the user has a default goal of 18h saved, **When** they navigate to the timer and prepare to start a fast, **Then** the 18h pill is pre-selected in the goal selector.
4. **Given** the user has a default goal set, **When** they start a fast and override the goal to a different value, **Then** the session uses the overridden value, not the default.
5. **Given** the user wants to remove their default goal, **When** they clear the selection in settings, **Then** future fasts no longer pre-fill a goal.

---

### Edge Cases

- What happens if the user enters 0 minutes or a negative value as a custom goal? The system rejects it and shows a validation error.
- What happens if the user enters an extremely long goal (e.g., 168h / 7 days)? The system caps the maximum goal at 72 hours (3 days) with a validation message.
- What happens if the user's browser does not support the Notification API? The app falls back to in-app toast only and does not prompt for notification permission.
- What happens if the user starts a fast, then the app is closed and reopened before the goal is reached? The progress ring recalculates from the persisted start time and current time.
- What happens if the user changes their default goal while a fast is already in progress? The active session's goal remains unchanged; the new default applies only to future sessions.
- What happens if the custom input contains non-numeric or invalid characters? The input is validated to accept only valid hour/minute values; invalid input is rejected.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display quick-select goal pills (12h, 16h, 18h, 20h, 24h) when the user is preparing to start a fast. Pills for known protocols (16h, 18h, 20h, 24h) MUST show a protocol subtitle (e.g., "Intermittent", "Advanced", "Warrior", "OMAD"). The 12h pill has no subtitle. This replaces the existing 2x2 protocol card grid.
- **FR-002**: System MUST allow the user to enter a custom goal duration in hours and minutes.
- **FR-003**: System MUST validate custom goal input: minimum 1 hour, maximum 72 hours, no negative or zero values.
- **FR-004**: System MUST save the selected goal with the fasting session when the fast is started.
- **FR-005**: System MUST pre-fill the goal selector with the user's default goal (if set in settings) when preparing a new fast.
- **FR-006**: System MUST display a circular progress ring that replaces the background fill animation when the user is fasting with a goal set. The HH:MM:SS elapsed timer MUST be displayed inside the ring, with percentage and remaining time as secondary labels below.
- **FR-007**: The progress ring MUST show the elapsed percentage and remaining time (e.g., "8h 23m to go") below the timer. When no goal is set, the existing timer card with fill animation MUST be used instead.
- **FR-008**: The progress ring MUST animate smoothly as time progresses.
- **FR-009**: When the goal is reached, the progress ring MUST change to a success color and play a celebration animation (respecting reduced-motion preferences).
- **FR-010**: System MUST send a browser notification when the fasting goal is reached, if notification permission is granted.
- **FR-011**: System MUST display an in-app toast notification as a fallback when browser notifications are unavailable or denied. The toast MUST auto-dismiss after 5 seconds and be tap-dismissible.
- **FR-012**: The notification message MUST read: "You've reached your [X]h fasting goal!" where [X] is the goal duration in hours.
- **FR-013**: System MUST NOT send duplicate notifications for the same session's goal.
- **FR-014**: System MUST provide a "Default fasting goal" setting on the settings page.
- **FR-015**: The default goal MUST persist across browser sessions and be editable or clearable at any time.
- **FR-016**: The default goal MUST NOT affect sessions already in progress; it applies only to new sessions.
- **FR-017**: When no goal is set for a session, the timer screen MUST display the existing timer without a progress ring.

### Key Entities

- **Fasting Session**: Represents an individual fast with start time, end time, and an optional goal duration in minutes. The goal is set at the start of the session and does not change during the fast.
- **User Settings**: Stores user preferences including an optional default goal duration in minutes. The default goal pre-fills the goal selector for new sessions.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can set a fasting goal (quick-select or custom) and start a fast in under 10 seconds.
- **SC-002**: The progress ring updates at least once per second and accurately reflects elapsed time within 1 second.
- **SC-003**: Goal-reached notification fires within 2 seconds of the goal time being met.
- **SC-004**: Default goal pre-fill works correctly on 100% of new session starts when a default is configured.
- **SC-005**: Custom goal validation correctly rejects all invalid inputs (zero, negative, exceeding 72h, non-numeric).
- **SC-006**: The celebration animation and ring color change are visible within 1 second of goal completion.

## Clarifications

### Session 2026-02-26

- Q: Should the existing protocol card grid be replaced by goal pills, kept as-is with custom added, or hybridized? → A: Hybrid — goal pills (12h, 16h, 18h, 20h, 24h) + custom input replace the protocol cards, but protocol names are preserved as subtitles on matching pills.
- Q: How should the progress ring relate to the existing timer card and fill animation? → A: Replace the fill animation with the progress ring as a unified display. HH:MM:SS timer inside the ring, percentage + "time to go" below. Existing fill animation kept only for no-goal sessions.
- Q: How long should the in-app toast stay visible and how is it dismissed? → A: Auto-dismiss after 5 seconds, tap-dismissible.

## Assumptions

- The existing 2x2 protocol card grid (16:8, 18:6, 20:4, 24h) is replaced by goal pills (12h, 16h, 18h, 20h, 24h) plus a custom input option. Known protocol names are preserved as subtitles on matching pills (16h→Intermittent, 18h→Advanced, 20h→Warrior, 24h→OMAD). The 12h pill is new and has no protocol subtitle.
- Browser notifications require a one-time permission grant from the user. The app will request permission at an appropriate moment (e.g., when the user first sets a goal). If the user denies permission, the app gracefully falls back to in-app toasts.
- When a goal is set, the progress ring replaces the background fill animation as the sole progress indicator. The HH:MM:SS timer, percentage, and "time to go" are all part of this unified ring display. When no goal is set, the existing timer card with fill animation remains unchanged.
- The celebration animation uses only `transform` and `opacity` properties per the project's animation guidelines.
- The maximum custom goal of 72 hours is a reasonable upper bound for extended fasting while preventing accidental extreme values.
