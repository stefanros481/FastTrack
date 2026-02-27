# Feature Specification: User Settings

**Feature Branch**: `010-user-settings`
**Created**: 2026-02-27
**Status**: Draft
**Input**: User description: "Let's implement epic-10 User settings. In addition, can you add the gmail image (if present) to the User settings page to identify the user in addition to the name?"

## User Scenarios & Testing

### User Story 1 - Settings Page with User Profile (Priority: P1)

As an authorized user, I want to see my profile information (name, Google profile image, and email) at the top of the settings page so I can confirm which account I'm signed into.

**Why this priority**: Identity confirmation is essential in a multi-user app — users need to know which account they're managing settings for before changing anything.

**Independent Test**: Navigate to `/settings`, verify the signed-in user's name, email, and Google profile image are displayed at the top of the page. If no profile image is available, a fallback (first letter of name or email) is shown instead.

**Acceptance Scenarios**:

1. **Given** a signed-in user with a Google profile image, **When** they navigate to settings, **Then** they see their profile image (circular), display name, and email address at the top of the page
2. **Given** a signed-in user without a profile image, **When** they navigate to settings, **Then** they see a fallback avatar showing the first letter of their name (or email) in a colored circle
3. **Given** an unauthenticated visitor, **When** they try to access settings, **Then** they are redirected to the sign-in page

---

### User Story 2 - Theme Selection (Priority: P1)

As a user, I want to switch between dark mode, light mode, and system-follows-OS so the app matches my visual preference.

**Why this priority**: Theme is a core personalization feature that affects every page. The existing home page theme toggle remains unchanged; the settings page adds a dedicated theme selector as the primary configuration surface.

**Independent Test**: Go to settings, change the theme from dark to light, verify the entire app updates immediately. Reload the page, verify the preference persists. Switch to "system" mode, verify it follows the OS preference.

**Acceptance Scenarios**:

1. **Given** a user on the settings page, **When** they select "Light" theme, **Then** the app immediately switches to light mode across all pages
2. **Given** a user on the settings page, **When** they select "System" theme, **Then** the app follows the operating system's dark/light preference
3. **Given** a user who set "Dark" theme, **When** they close the browser and return later, **Then** the app loads in dark mode without a flash of the wrong theme
4. **Given** a user changes theme in settings, **When** they navigate to the home page, **Then** the theme toggle on the home page reflects the same setting

---

### User Story 3 - Default Fasting Goal (Priority: P2)

As a user, I want to set a default fasting goal in settings so that every new fast automatically uses my preferred duration.

**Why this priority**: The default goal setting already exists in the UI but should be part of the unified settings page for consistency.

**Independent Test**: Set a default goal of 16 hours in settings, start a new fast from the home page, verify the 16-hour goal is pre-selected.

**Acceptance Scenarios**:

1. **Given** a user on the settings page, **When** they set a default goal of 18 hours, **Then** the preference is saved and reflected on next page load
2. **Given** a user with a default goal set, **When** they start a new fast, **Then** the goal ring uses the saved default duration
3. **Given** a user who wants no default goal, **When** they clear the goal in settings, **Then** new fasts start without a goal pre-selected

---

### User Story 4 - Sign Out (Priority: P2)

As a user, I want to sign out from the settings page so I can end my session securely.

**Why this priority**: Sign out is a necessary security control, especially in a multi-user app. It already exists but should be positioned consistently within the settings layout.

**Independent Test**: Click sign out on the settings page, verify the user is redirected to the sign-in page and cannot access protected routes.

**Acceptance Scenarios**:

1. **Given** a signed-in user on the settings page, **When** they tap "Sign out", **Then** their session ends and they are redirected to the sign-in page
2. **Given** a signed-out user, **When** they navigate to any protected route, **Then** they are redirected to sign-in

---

### User Story 5 - Notification Preferences (Priority: P3)

As a user, I want to configure notification settings (daily reminder toggle, reminder time, max duration alert) so I receive timely prompts about my fasting schedule.

**Why this priority**: Notifications enhance engagement but are not critical for core functionality. The database fields already exist but the UI has not been built.

**Independent Test**: Enable daily reminders in settings, set a reminder time, verify the preference is saved. Enable max duration alert, verify it persists.

**Acceptance Scenarios**:

1. **Given** a user on the settings page, **When** they enable daily reminders and set a time of 8:00 AM, **Then** the preference is saved
2. **Given** a user on the settings page, **When** they set a max duration alert of 24 hours, **Then** the preference is saved
3. **Given** a user who disables daily reminders, **When** they return to settings, **Then** the toggle shows "off" and reminder time is hidden

---

### Edge Cases

- What happens when the Google profile image URL becomes invalid or returns a 404? The system displays the letter-based fallback avatar.
- What happens when a user has no name set (e.g., dev credentials)? The email address is used as the display identifier, and the fallback avatar uses the first letter of the email.
- What happens when the user changes theme while a fast is actively running? The timer and progress ring update to the new theme colors immediately without disrupting the timer.
- What happens when reminder time is set but reminders are toggled off? The time value is preserved but not active — re-enabling reminders restores the previously set time.

## Requirements

### Functional Requirements

- **FR-001**: The settings page MUST display the user's profile image (from their authentication provider) as a circular avatar at the top of the page
- **FR-002**: If no profile image is available, the system MUST display a fallback avatar showing the first letter of the user's name (or email if no name exists)
- **FR-003**: The settings page MUST display the user's name and email address alongside the profile image
- **FR-004**: The settings page MUST provide a theme selector with three options: Dark, Light, and System
- **FR-005**: Theme changes MUST take effect immediately across the entire application without a page reload
- **FR-006**: Theme preference MUST be persisted server-side and restored on subsequent visits without a flash of incorrect theme
- **FR-007**: The settings page MUST allow users to set or clear a default fasting goal (in hours)
- **FR-008**: The settings page MUST provide a sign-out action that ends the user's session
- **FR-009**: The settings page MUST provide a toggle for daily fasting reminders with a configurable reminder time
- **FR-010**: The settings page MUST provide a configurable max duration alert (in hours)
- **FR-011**: All settings MUST be persisted server-side so they survive across devices and sessions
- **FR-012**: The settings page MUST be responsive and follow the app's mobile-first design language
- **FR-013**: The settings page MUST only be accessible to authenticated users

### Key Entities

- **UserSettings**: Per-user preferences including theme, default fasting goal, reminder configuration, and max duration alert
- **User**: The authenticated user's profile data (name, email, profile image URL) sourced from the authentication provider

## Success Criteria

### Measurable Outcomes

- **SC-001**: Users can identify their signed-in account (name + image) within 1 second of loading the settings page
- **SC-002**: Theme changes apply across all pages within 200ms of selection with no visible flash
- **SC-003**: All settings persist correctly across browser sessions — 100% of saved preferences are restored on return visits
- **SC-004**: Settings page loads and is interactive within 2 seconds on a standard mobile connection
- **SC-005**: 100% of settings changes are confirmed visually (immediate UI feedback) without requiring a page reload

## Clarifications

### Session 2026-02-27

- Q: Should the home page theme toggle be removed, kept, or replaced with a link to settings? → A: Keep it as-is. The home page toggle remains unchanged; the settings page adds its own theme selector independently. Both use the same persisted preference.

## Assumptions

- The user's profile image URL is stored in the database `User.image` field and populated from the Google OAuth profile on sign-in
- Dev credentials users may not have a profile image — the fallback avatar handles this gracefully
- The existing `ThemeProvider` component and `updateTheme`/`getTheme` server actions provide the foundation for theme management. The home page `ThemeToggle` component remains unchanged — both it and the settings theme selector share the same server-side preference
- The existing `DefaultGoalSetting` component can be reused or adapted for the settings page
- Notification preferences (reminder toggle, reminder time, max duration) are saved to the database but the actual notification delivery mechanism (browser notifications, push) is handled by the existing notifications epic (epic-09) — this feature only manages the preference UI
- The settings page design follows the specifications in epic-10-settings.md: section grouping, card styling, spacing, and touch targets
