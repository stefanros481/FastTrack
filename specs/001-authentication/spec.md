# Feature Specification: Authentication

**Feature Branch**: `001-authentication`
**Created**: 2026-02-22
**Status**: Draft
**Input**: Epic 1 — Authentication (plans/epic-01-authentication.md)

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Sign In with Google (Priority: P1)

The app owner navigates to any page of the app, is redirected to the sign-in page, and
authenticates using their Google account. Only the pre-configured owner email is permitted.
After successful sign-in, the user lands on the home page and a personal record is created
in the system if it is their first visit.

**Why this priority**: Without sign-in, the app cannot be used at all. This is the
single gate to every other feature.

**Independent Test**: Open the app in a fresh browser session and complete sign-in with
the authorized Google account. The home page loads and subsequent navigation does not
prompt for re-authentication.

**Acceptance Scenarios**:

1. **Given** the user is unauthenticated, **When** they navigate to any protected page,
   **Then** they are redirected to `/auth/signin` with no content from the protected page
   shown.
2. **Given** the user is on the sign-in page, **When** they click "Sign in with Google"
   and authenticate with the authorized email, **Then** they are redirected to the home
   page.
3. **Given** the user is on the sign-in page, **When** they attempt to sign in with any
   email other than the authorized one, **Then** sign-in is rejected and the error message
   "This app is private. Access denied." is displayed.
4. **Given** the user has never signed in before, **When** they successfully sign in,
   **Then** a user profile and default settings record are created for them.

---

### User Story 2 — Stay Signed In Across Sessions (Priority: P2)

The app owner signs in once and remains authenticated across browser restarts, device
sleep, and new tabs without being asked to sign in again, for up to 30 days.

**Why this priority**: Re-authenticating daily would make a personal tool feel broken.
Persistent sessions are core to a frictionless experience.

**Independent Test**: Sign in, close the browser entirely, reopen it, and navigate to
the app. The home page loads without a redirect to sign-in.

**Acceptance Scenarios**:

1. **Given** the user is authenticated, **When** they close and reopen the browser,
   **Then** they are still signed in and land directly on the home page.
2. **Given** the user is authenticated, **When** they visit the app within 30 days,
   **Then** the session is renewed and the 30-day window resets.
3. **Given** more than 30 days have passed since the last visit, **When** the user
   opens the app, **Then** they are redirected to `/auth/signin`.

---

### User Story 3 — Sign Out (Priority: P3)

The app owner can explicitly terminate their session from the settings page. After signing
out, they are redirected to the sign-in page and cannot access protected pages without
re-authenticating.

**Why this priority**: Signing out is infrequently needed for a single-user personal
app but is a necessary security control.

**Independent Test**: Navigate to settings, sign out, then attempt to navigate to the
home page. The sign-in page is shown.

**Acceptance Scenarios**:

1. **Given** the user is signed in, **When** they tap the sign-out option in settings,
   **Then** their session is ended and they are redirected to `/auth/signin`.
2. **Given** the user has signed out, **When** they navigate to any protected page,
   **Then** they are redirected to `/auth/signin`.

---

### Edge Cases

- What happens when the Google OAuth provider is temporarily unavailable? The sign-in
  page MUST display the inline message "Sign-in is temporarily unavailable. Please try
  again later." The user remains on the sign-in page with no redirect.
- What happens when the user's session cookie is tampered with or expired mid-session?
  They should be silently redirected to `/auth/signin` on their next request.
- What happens if the `AUTHORIZED_EMAIL` environment variable is not configured? The
  system must fail closed — no one can sign in.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST redirect all unauthenticated requests to `/auth/signin`,
  regardless of the requested path, except for requests to `/auth/*` and `/api/auth/*`.
- **FR-002**: The sign-in page MUST offer exactly one sign-in method: Google OAuth.
- **FR-003**: The system MUST reject any sign-in attempt from an email address that does
  not exactly match the value of the `AUTHORIZED_EMAIL` configuration variable.
- **FR-004**: Rejected sign-in attempts MUST display the message "This app is private.
  Access denied." and MUST NOT redirect the user anywhere.
- **FR-005**: Upon the first successful sign-in, the system MUST create a user profile
  record and a settings record with default values.
- **FR-006**: Subsequent sign-ins by the same user MUST be idempotent — no duplicate
  records may be created.
- **FR-007**: Authenticated sessions MUST persist for 30 days from the last visit
  (sliding window renewal).
- **FR-008**: The system MUST provide a sign-out action accessible from the settings
  page that clears the client-side session cookie (soft sign-out). No server-side
  session revocation or blocklist is required.
- **FR-009**: After sign-out, all protected routes MUST require re-authentication.

### Key Entities

- **User**: The single authorized person. Has a profile (display name, avatar URL from
  Google) and a creation timestamp. Identified by their email address.
- **UserSettings**: A 1:1 record tied to the User, created with defaults on first sign-in.
  Stores preferences (default fasting goal, notification preferences, theme). A User
  cannot exist without a corresponding UserSettings record after first login.
- **Session**: A time-bounded authentication token associated with the User. Stateless
  (stored client-side as a signed cookie). Expires after 30 days of inactivity.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The owner can sign in and reach the home page in under 10 seconds on a
  standard mobile connection.
- **SC-002**: 100% of requests to protected pages while unauthenticated result in a
  redirect to the sign-in page — no protected content is ever visible without a valid
  session.
- **SC-003**: Sign-in attempts from unauthorized email addresses are rejected 100% of
  the time with no access granted.
- **SC-004**: The owner is not prompted to sign in again within 30 days of their last
  visit.
- **SC-005**: After signing out, 100% of subsequent attempts to access protected pages
  redirect to the sign-in page.

## Clarifications

### Session 2026-02-22

- Q: After sign-out, should the session be revoked server-side or only cleared client-side? → A: Soft sign-out only — clear the client cookie; no server-side session blocklist required.
- Q: When Google OAuth is temporarily unavailable, how should the sign-in page respond? → A: Show inline message "Sign-in is temporarily unavailable. Please try again later." User stays on sign-in page.
- Q: Should failed sign-in attempts from unauthorized emails be explicitly logged? → A: No explicit logging requirement — platform (Vercel) server logs are sufficient.

## Assumptions

- A single Google account (identified by `AUTHORIZED_EMAIL`) is the only supported
  identity. Multi-user or multi-provider support is explicitly out of scope.
- The `AUTHORIZED_EMAIL` value is set as a server-side environment variable before
  deployment. If it is missing, sign-in is disabled for all users.
- Session renewal on each visit is the expected behavior (sliding expiry), not a fixed
  expiry from the original sign-in time.
