# Feature Specification: Database Connection Status Indicator

**Feature Branch**: `015-connection-status`
**Created**: 2026-03-05
**Status**: Draft
**Input**: User description: "Add a UI indicator showing whether the backend/database is online, so users know not to start activities before the system is ready. The database (Neon free tier) goes to sleep after inactivity and needs time to wake up."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - See Backend Readiness on App Load (Priority: P1)

As a user opening the app after a period of inactivity, I want to see whether the backend is ready before I start any fasting activity. When the database is asleep (Neon free tier), it takes several seconds to wake up. During this time, I should see a clear visual indicator that the system is still connecting, and any actions that depend on the backend (like starting a fast) should be prevented until the connection is established.

**Why this priority**: This is the core purpose of the feature. Without this, users may attempt to start a fast while the database is still waking up, leading to errors or failed requests.

**Independent Test**: Can be tested by opening the app after the database has been idle for 5+ minutes and observing the status indicator transition from "Connecting" to "Online".

**Acceptance Scenarios**:

1. **Given** the app is opened after the database has been idle, **When** the page loads, **Then** a status indicator appears showing "Connecting..." with a yellow dot
2. **Given** the status indicator shows "Connecting...", **When** the backend health check responds successfully, **Then** the indicator transitions to "Online" with a green dot
3. **Given** the status indicator shows "Connecting...", **When** the "Start Fast" button is visible, **Then** the button is disabled and cannot be tapped

---

### User Story 2 - Confirmation That System Is Ready (Priority: P1)

As a user, once the backend is confirmed online, I want the status indicator to briefly confirm "Online" and then fade away so it does not clutter the interface during normal use.

**Why this priority**: Equally important as Story 1 — the user needs positive confirmation that the system is ready, and the indicator should not permanently occupy screen space.

**Independent Test**: Can be tested by waiting for the health check to succeed and verifying the green "Online" indicator appears and then auto-hides after a short delay.

**Acceptance Scenarios**:

1. **Given** the health check succeeds, **When** the indicator shows "Online", **Then** it auto-hides after approximately 3 seconds
2. **Given** the indicator has auto-hidden, **When** the user looks at the header area, **Then** no status indicator is visible
3. **Given** the indicator shows "Online", **When** the "Start Fast" button is visible, **Then** the button is enabled and can be tapped

---

### User Story 3 - Offline / Unreachable Backend (Priority: P2)

As a user, if the backend cannot be reached at all (network issue, prolonged outage), I want the indicator to show "Offline" so I know the app is not functional and I should try again later.

**Why this priority**: Less common than the wake-up scenario but still important for user trust and preventing frustrating errors.

**Independent Test**: Can be tested by blocking network access or pointing to an unreachable endpoint and verifying the "Offline" indicator persists.

**Acceptance Scenarios**:

1. **Given** the health check fails (network error or server error), **When** the result is received, **Then** the indicator shows "Offline" with a red dot
2. **Given** the indicator shows "Offline", **When** the "Start Fast" button is visible, **Then** the button remains disabled
3. **Given** the indicator shows "Offline", **When** the system retries the health check and it succeeds, **Then** the indicator transitions to "Online" with a green dot

---

### User Story 4 - Automatic Retry When Offline (Priority: P2)

As a user seeing the "Offline" indicator, I want the system to automatically retry connecting so I do not have to manually refresh the page.

**Why this priority**: Improves the experience during the database wake-up period, which typically takes 5-10 seconds. Without auto-retry, the user would need to refresh the page.

**Independent Test**: Can be tested by simulating a temporarily unavailable backend and verifying the system retries and eventually transitions to "Online".

**Acceptance Scenarios**:

1. **Given** the health check fails, **When** the indicator shows "Offline" or "Connecting...", **Then** the system retries the health check at a regular interval
2. **Given** the system is retrying, **When** a retry succeeds, **Then** the indicator transitions to "Online" and retries stop

---

### Edge Cases

- What happens if the health check takes an unusually long time (e.g., 30+ seconds)? The indicator should continue showing "Connecting..." until a response or timeout is received.
- What happens if the user already has an active fasting session when the app loads? The timer should display with cached data, but the "End Session" button behavior should not be blocked (the session is already server-side).
- What happens if the user navigates away and back? The status should re-check on each app load.
- What happens if the health check succeeds but subsequent server actions fail? This feature only covers initial readiness; individual action errors are handled by existing error toasts.

## Clarifications

### Session 2026-03-05

- Q: Should navigation tabs (History, Insights) or session actions (end/cancel) also be blocked while offline? → A: Only the "Start Fast" button is blocked. Read-only views handle their own errors. Ending or canceling an active session is never blocked — those actions either succeed or show their own error toast.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a health check endpoint that verifies backend and database connectivity
- **FR-002**: System MUST display a connection status indicator in the app header on page load
- **FR-003**: System MUST show a "Connecting..." state with a yellow indicator while the health check is in progress
- **FR-004**: System MUST show an "Online" state with a green indicator when the health check succeeds
- **FR-005**: System MUST show an "Offline" state with a red indicator when the health check fails
- **FR-006**: System MUST auto-hide the "Online" indicator after approximately 3 seconds
- **FR-007**: System MUST disable only the "Start Fast" button while the status is not "Online". Ending or canceling an active session, navigating between views, and all read-only operations MUST NOT be blocked
- **FR-008**: System MUST automatically retry the health check approximately every 5 seconds after a failed attempt (i.e., when the status transitions to "Offline"). The initial page load fetch covers the "Connecting" state; retries apply only after failure
- **FR-009**: System MUST stop retrying once the health check succeeds
- **FR-010**: The indicator MUST use a pulsing animation while in the "Connecting" state to communicate ongoing activity
- **FR-011**: The indicator MUST respect the user's reduced-motion preference for the pulsing animation (use `motion-safe:` prefix)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users see a visible connection status within 1 second of opening the app
- **SC-002**: Users are prevented from starting a fast while the backend is not confirmed online (0% of "Start Fast" taps succeed during "Connecting" or "Offline" states)
- **SC-003**: The indicator transitions to "Online" within 2 seconds of the health check succeeding
- **SC-004**: The "Online" indicator auto-hides within 5 seconds, leaving no visual clutter
- **SC-005**: When the database is waking up, the system automatically recovers without requiring a page refresh
