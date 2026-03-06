# Feature Specification: Backend Readiness Check

**Feature Branch**: `020-backend-readiness`
**Created**: 2026-03-06
**Status**: Draft
**Input**: User description: "We need to add additional functionality to what we developed as part of 015-connection-status to ensure the app (backend) is really ready to take user commands."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Deep Health Check Validates Full Backend Readiness (Priority: P1)

As a user opening the app after a period of inactivity, I want the system to verify not just that the database responds to a simple ping, but that the backend is truly ready to handle my actions -- authentication is working, the database schema is accessible, and server actions can execute successfully. Currently, the health check only runs `SELECT 1`, which confirms the database connection is alive but does not guarantee the app can actually process user commands (e.g., an ORM misconfiguration, a missing migration, or an expired auth setup could still cause failures).

**Why this priority**: This is the core gap in the current 015-connection-status feature. A superficial health check gives false confidence; users see "Online" but then encounter errors when they try to start a fast.

**Independent Test**: Can be tested by verifying that the health endpoint performs a real query against an application table (e.g., counting rows or reading a known record) and validates that the auth layer is functional, returning "Online" only when all checks pass.

**Acceptance Scenarios**:

1. **Given** the app is loaded and the health check runs, **When** the database connection is alive but the application tables are inaccessible (e.g., migration not applied), **Then** the health check reports a failure and the indicator shows "Offline"
2. **Given** the app is loaded, **When** the health check successfully queries an application table and confirms auth readiness, **Then** the indicator shows "Online" and the "Start Fast" button is enabled
3. **Given** the health check endpoint is called, **When** all subsystems (database schema, auth) respond correctly, **Then** the response includes the status of each checked subsystem

---

### User Story 2 - Granular Status Reporting (Priority: P2)

As a user, when something is wrong with the backend, I want to understand what specifically is not ready so I have appropriate expectations. Instead of a generic "Offline" message, the system should distinguish between "Database waking up" and "Service unavailable" so I know whether to wait a few seconds or come back later.

**Why this priority**: Improves user trust and reduces confusion. When the Neon free-tier database is waking up (typically 5-10 seconds), users should know this is a temporary, expected delay rather than a system failure.

**Independent Test**: Can be tested by simulating different failure modes (database unreachable vs. auth failure) and verifying the indicator shows the appropriate contextual message.

**Acceptance Scenarios**:

1. **Given** the health check fails (any reason: database unreachable, app-level check fails, or timeout), **When** the result is displayed and fewer than 3 retries have failed, **Then** the indicator shows "Connecting..." (warming up state)
2. **Given** the health check has failed 3 consecutive times (any failure type), **When** the result is displayed, **Then** the indicator transitions from "Connecting..." to "Unavailable" indicating a persistent issue
3. **Given** all checks pass after a period of degraded status, **When** the indicator transitions to "Online", **Then** the previous degraded-state message is cleared

---

### User Story 3 - Health Check Response Time Budget (Priority: P2)

As a user, I want the readiness check to complete within a reasonable time so I am not left staring at "Connecting..." indefinitely. The system should enforce a timeout on the health check so that a hung database connection is detected and reported as offline promptly.

**Why this priority**: Without a timeout, a stalled connection could leave the user in "Connecting..." state indefinitely, which is worse than showing "Offline" and retrying.

**Independent Test**: Can be tested by simulating a database that accepts the connection but never responds, and verifying the health check times out and reports "Offline" within the expected budget.

**Acceptance Scenarios**:

1. **Given** the health check is in progress, **When** the backend does not respond within 10 seconds, **Then** the check is treated as failed and the indicator shows "Offline"
2. **Given** the health check times out, **When** the retry fires, **Then** it uses the same timeout budget for each attempt

---

### User Story 4 - Blocking Critical Actions Until Ready (Priority: P1)

As a user, I want all write actions that depend on the backend (starting a fast, saving settings) to be blocked until the backend is confirmed ready -- not just the "Start Fast" button. The current implementation only disables "Start Fast", but other actions that write to the database could also fail silently.

**Why this priority**: Extending the protection to all write actions prevents confusing errors across the app, not just on the home screen.

**Independent Test**: Can be tested by attempting to trigger write actions (start fast, save settings, edit session) while the health check is in "Connecting" or "Offline" state, and verifying all are blocked with a clear message.

**Acceptance Scenarios**:

1. **Given** the backend status is not "Online", **When** the user views the "Start Fast" button, **Then** the button is disabled; tapping it shows a tooltip "System connecting, please wait..."
2. **Given** the backend status is not "Online", **When** the user views save/edit buttons (settings, session edit, notes), **Then** they are disabled; tapping shows a tooltip explaining the system is not ready
3. **Given** the backend transitions to "Online", **When** the user attempts any write action, **Then** the action proceeds normally

---

### Edge Cases

- What if the health check succeeds on the simple DB ping but fails on the application-table query? The system should report "Offline" since the app is not truly ready.
- What if the health check response is received after the component has unmounted (user navigated away)? The response should be safely ignored (existing cancelled-flag pattern handles this).
- What if the health check passes but a subsequent write action still fails (e.g., transient network blip)? This feature covers initial readiness only; individual action errors continue to be handled by existing error toasts.
- What if the user has an active fasting session when the app loads and the backend is not yet ready? The timer should display with cached/server-rendered data. The "End Session" button should remain functional since it is less critical than starting a new session.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The health check endpoint MUST verify database connectivity by querying an application table (not just `SELECT 1`), confirming the schema and ORM layer are functional
- **FR-002**: The health check endpoint MUST verify that the authentication subsystem is operational
- **FR-003**: The health check response MUST include individual status for each checked subsystem (database, auth) so the client can provide granular feedback
- **FR-004**: The health check MUST complete within a 10-second timeout budget; if exceeded, the check MUST be treated as a failure
- **FR-005**: The system MUST block write actions (start fast, save settings, edit session, add/edit notes) while the backend status is not "Online", not just the "Start Fast" button. Exception: ending or canceling an active session MUST NOT be blocked, since the session already exists server-side
- **FR-006**: Blocked write actions MUST be communicated by disabling the relevant buttons; tapping a disabled button MUST show a tooltip/brief message (e.g., "System connecting, please wait...")
- **FR-007**: The connection status indicator MUST show contextual messages distinguishing between "warming up" (database cold start) and "unavailable" (persistent failure) states. The system MUST transition from "warming up" to "unavailable" after 3 consecutive failed retries (~15 seconds)
- **FR-008**: The existing retry mechanism (every ~5 seconds) MUST continue to function with the enhanced health check
- **FR-009**: The health check query MUST add less than 50ms overhead beyond the database connection time, ensuring it does not delay the wake-up process or add excessive load

## Assumptions

- The Neon free-tier database cold start typically takes 5-10 seconds; the 10-second timeout budget accommodates this.
- "Blocked write actions" include: starting a fast, editing session times, adding/editing notes, deleting completed sessions, and saving any settings. Read-only operations (viewing history, viewing statistics) are not blocked. Ending or canceling an active session is also not blocked (session already exists server-side, consistent with 015-connection-status).
- The existing `ConnectionStatus` component UI pattern (dot + label in header, auto-hide on success) is preserved and extended, not replaced.
- The existing retry interval of ~5 seconds is appropriate and does not need to change.

## Clarifications

### Session 2026-03-06

- Q: What should the health check timeout budget be? → A: 10 seconds
- Q: Should ending/canceling an active session be blocked while backend is not ready? → A: No, keep unblocked -- session already exists server-side
- Q: When should "warming up" transition to "unavailable"? → A: After 3 consecutive failed retries (~15 seconds)
- Q: How should blocked actions communicate to the user? → A: Disable buttons + tooltip on tap showing "System connecting, please wait..."

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users are never shown "Online" when the backend cannot actually process write commands (zero false-positive "Online" states)
- **SC-002**: The health check detects application-level failures (missing tables, ORM issues) that a simple `SELECT 1` would miss
- **SC-003**: Users see a contextual status message within 1 second of opening the app that distinguishes between "warming up" and "unavailable"
- **SC-004**: All write actions across the app are blocked while the backend is not confirmed ready, preventing user-facing errors from premature actions
- **SC-005**: The health check completes or times out within the defined budget, ensuring users never wait indefinitely in a "Connecting..." state
- **SC-006**: Once the backend is confirmed ready, all previously blocked actions become available within 2 seconds
