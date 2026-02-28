# Feature Specification: Long-Press Progress Ring to End Session

**Feature Branch**: `012-long-press-end-session`
**Created**: 2026-02-28
**Status**: Draft
**Input**: User description: "Instead of pressing the end session button, the user should press the progress circle and hold it in while there is a circle going full within five seconds. If the user lets off the finger press before the timer is out, the session is not ended."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - End Fast via Long Press on Progress Ring (Priority: P1)

A user with an active fasting session presses and holds the progress ring for 5 seconds to end their fast. While holding, an inner confirmation circle animates from empty to full over the 5-second duration. A text hint ("Hold to end...") is displayed during the hold. When the circle completes, the session ends automatically.

**Why this priority**: This is the core interaction — the primary (and only) way to end a session. Without this, the feature doesn't exist.

**Independent Test**: Can be fully tested by starting a fast, pressing and holding the progress ring for 5 seconds, and verifying the session ends. Delivers the complete long-press-to-end experience.

**Acceptance Scenarios**:

1. **Given** the user has an active fasting session with a progress ring visible, **When** the user presses and holds the progress ring for 5 continuous seconds, **Then** the fasting session ends, the timer resets, and the idle/goal-selector screen is shown.
2. **Given** the user has an active fasting session with a progress ring visible, **When** the user presses and holds the progress ring but releases before 5 seconds, **Then** the session continues uninterrupted, the confirmation circle resets to empty, and the hint text disappears.
3. **Given** the user has an active fasting session with a progress ring visible, **When** the user begins pressing the progress ring, **Then** an inner confirmation circle begins animating from 0% to 100% over 5 seconds, and a text hint ("Hold to end...") appears.

---

### User Story 2 - Long Press on Progress Ring for No-Goal Sessions (Priority: P1)

A user who started a fast without selecting a specific goal sees a progress ring (using a default reference like 16 hours). They can use the same long-press gesture on this ring to end their session.

**Why this priority**: Since the "End Fast" button is being removed entirely, every active session must have a way to end. Sessions without an explicit goal must also show a progress ring so the long-press gesture is always available.

**Independent Test**: Can be tested by starting a fast without selecting a goal, verifying a progress ring is displayed, then long-pressing it for 5 seconds to end the session.

**Acceptance Scenarios**:

1. **Given** the user started a fast without a goal, **When** the active timer view is displayed, **Then** a progress ring is shown (using a default reference duration) instead of the plain timer card.
2. **Given** the user started a fast without a goal and sees the progress ring, **When** the user long-presses the ring for 5 seconds, **Then** the session ends just like a goal-based session.

---

### User Story 3 - Visual Feedback During Long Press (Priority: P2)

While the user is holding the progress ring, clear visual feedback communicates progress toward ending the session. An animated confirmation circle fills up over 5 seconds, and a text label guides the user.

**Why this priority**: Good visual feedback prevents confusion and accidental ends. Without it users won't know to keep holding or how long is left.

**Independent Test**: Can be tested by pressing and holding the progress ring and observing that the inner confirmation circle animates smoothly from 0% to 100% over 5 seconds, and that the text hint "Hold to end..." is visible during the hold.

**Acceptance Scenarios**:

1. **Given** the user presses and holds the progress ring, **When** the hold begins, **Then** a confirmation circle inside the ring starts animating from empty to full over 5 seconds.
2. **Given** the user is holding the progress ring and sees the confirmation circle partially filled, **When** the user releases, **Then** the confirmation circle animates back to empty smoothly.
3. **Given** the user is holding the progress ring, **When** the hold is active, **Then** a text hint (e.g., "Hold to end...") is displayed near or below the ring.
4. **Given** the user holds the progress ring for the full 5 seconds, **When** the confirmation circle reaches 100%, **Then** the text changes to indicate completion (e.g., "Session ended") before the view transitions.

---

### Edge Cases

- What happens if the user drags their finger off the progress ring while holding? The hold should cancel and the confirmation circle should reset.
- What happens if the user holds with multiple fingers or uses a mouse? The same single-press behavior applies regardless of input method.
- What happens if a network error occurs when ending the session? The session end should be attempted and the user should see appropriate feedback if it fails (circle resets and an error indication is shown).
- What happens if the user taps the progress ring quickly (not a hold)? Nothing happens — the existing start-time editing behavior via the "Started..." button below the ring remains unaffected.
- What happens on very slow devices where animation might lag? The 5-second timer is based on wall-clock time, not animation frames, so the session ends at the right time regardless of animation smoothness.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST end the active fasting session when the user continuously presses and holds the progress ring for 5 seconds.
- **FR-002**: System MUST display an animated confirmation circle inside the progress ring — rendered in a red/warm color (matching the app's stop/error color) — that fills from 0% to 100% over the 5-second hold duration, visually distinct from the indigo fasting progress arc.
- **FR-003**: System MUST display a text hint ("Hold to end...") while the user is actively holding the progress ring.
- **FR-004**: System MUST cancel the end-session action and reset the confirmation circle if the user releases before 5 seconds.
- **FR-005**: System MUST always display a progress ring during an active session, including sessions without an explicit goal (using a default reference duration).
- **FR-006**: System MUST remove the "End Fast" button — the long-press gesture is the sole method to end a session.
- **FR-007**: System MUST cancel the hold if the user's touch/pointer leaves the progress ring area before 5 seconds.
- **FR-008**: The confirmation circle animation MUST be smooth and represent real elapsed time (wall-clock based, not frame-based).
- **FR-009**: System MUST provide clear visual feedback when the 5-second hold completes (e.g., brief completion state before transitioning).
- **FR-010**: System MUST display a persistent subtle text hint below the progress ring (e.g., "Hold ring to end") during all active sessions, so users can discover the long-press gesture without needing to touch the ring first.
- **FR-011**: System MUST provide a visually hidden but screen-reader and keyboard-accessible "End session" action as a fallback for users who cannot perform the long-press gesture.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can end their fasting session by holding the progress ring for 5 seconds, with 100% reliability.
- **SC-002**: The confirmation circle animation completes in exactly 5 seconds (within 200ms tolerance).
- **SC-003**: Releasing before 5 seconds results in no session change 100% of the time.
- **SC-004**: The progress ring is visible for all active sessions, regardless of whether a goal was set.
- **SC-005**: The "End Fast" button is no longer present in the active session view.
- **SC-006**: The persistent "Hold ring to end" hint text is visible below the progress ring at all times during an active session, without requiring any user interaction to appear.

## Clarifications

### Session 2026-02-28

- Q: How should the system hint at the long-press gesture for discoverability? → A: Show a persistent subtle text hint below the ring (e.g., "Hold ring to end") during all active sessions.
- Q: Should there be an accessible fallback for users who cannot perform a long-press gesture? → A: Yes — provide a visually hidden but screen-reader/keyboard-accessible "End session" action as a fallback.
- Q: What color/style should the confirmation circle use? → A: Red/warm color (matching the app's error/stop color) to clearly signal "ending" intent, distinct from the indigo progress arc.

## Assumptions

- The 5-second hold duration is appropriate for preventing accidental session endings while not being frustratingly long.
- A default reference duration of 16 hours for no-goal sessions is acceptable for displaying the progress ring (this matches the existing default used in the timer calculation).
- The existing "Started..." button below the progress ring for editing start time remains unchanged and is not affected by the long-press gesture on the ring itself.
- Touch events and pointer events are the relevant input models (mobile-first app); mouse long-press also works for desktop testing.
