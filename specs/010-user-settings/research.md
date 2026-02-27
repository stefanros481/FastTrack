# Research: User Settings

## Decision 1: Profile Image Handling

**Decision**: Use a standard `<img>` tag with `onError` fallback to a letter-based avatar. No external avatar libraries needed.

**Rationale**: The Google OAuth profile image URL is already stored in `User.image`. A simple `<img>` with an error handler that swaps to a CSS circle with the user's initial is lightweight, requires no dependencies, and handles all edge cases (no image, broken URL, dev credentials).

**Alternatives considered**:
- **next/image with remote patterns**: Adds complexity of configuring `remotePatterns` in `next.config.ts` for Google's image CDN domains (`lh3.googleusercontent.com`, etc.). The images are small avatars — optimization overhead is unnecessary.
- **Gravatar fallback**: Adds an external dependency and doesn't help for dev credential users who may not have Gravatar.

## Decision 2: Theme Selector UI Pattern

**Decision**: Use a 3-button segmented control (Dark / System / Light) with Lucide icons. Each button highlights when active.

**Rationale**: The spec requires 3 options (dark, system, light). A segmented control is the most common mobile pattern for 3 mutually exclusive choices. It's more discoverable than a dropdown and more explicit than a cycling toggle. The existing `ThemeToggle` in `FastingTimer` uses a cycling pattern — the settings page should be more explicit since users may not know the current state.

**Alternatives considered**:
- **Pill-style toggle**: Epic mentions "pill-style switch" but that pattern is for binary choices. With 3 options, a segmented control is the correct adaptation.
- **Dropdown/select**: Less discoverable on mobile, requires extra tap to reveal options.
- **Radio buttons**: Less visually polished for a premium UI.

## Decision 3: Notification Settings Scope

**Decision**: Build the notification preferences UI (reminder toggle, reminder time, max duration alert) that persists to the database. Do NOT implement the actual notification delivery — that is handled by epic-09 (Notifications).

**Rationale**: The `UserSettings` model already has `reminderEnabled`, `reminderTime`, and `maxDurationMinutes` fields. Building the UI now allows users to set preferences that will be consumed when notification delivery is implemented. This separates concerns cleanly.

**Alternatives considered**:
- **Defer entirely until epic-09**: Leaves settings page incomplete and requires revisiting the layout later.
- **Implement notifications end-to-end**: Out of scope for this epic — the spec explicitly states "this feature only manages the preference UI."

## Decision 4: User Profile Data Source

**Decision**: Fetch user profile data (name, email, image) from the database `User` model via a server action, not from the JWT session token.

**Rationale**: The JWT session contains `id`, `email`, `name`, and `image` from the `DefaultSession` type. However, the `User` table is the authoritative source and always has the latest data from the most recent sign-in. Additionally, user image is not guaranteed to be in the JWT token (it depends on the provider configuration). Querying the DB ensures we always have the correct, current profile data.

**Alternatives considered**:
- **Use `session.user` from JWT**: Simpler but may have stale data if the user's Google profile changed. Also, `image` may not be in the token depending on Auth.js configuration.
- **Use `session.user` with DB fallback**: Overly complex for a single query.

## Decision 5: Component Extraction Strategy

**Decision**: Extract sign-out into a `SignOutButton` client component. Create new `UserProfile`, `ThemeSelector`, and `NotificationSettings` client components. Keep `DefaultGoalSetting` as-is (already exists and works).

**Rationale**: The settings page is a server component that needs to compose multiple interactive sections. Each section has its own client-side state and server action calls. Separate components keep responsibilities clean and allow parallel development.

**Alternatives considered**:
- **Single monolithic client component**: Violates Principle III (server-first architecture) and makes the entire page a client component.
- **Inline everything in `page.tsx`**: Server components can't have interactive controls inline — client component boundaries are required.

## Decision 6: Settings Page Layout

**Decision**: Group settings into sections following epic-10 design: Profile (top), Fasting section (default goal), Notifications section (reminders, max duration), Appearance section (theme), Account section (sign out at bottom).

**Rationale**: The epic-10 design specifies section headers with `text-xl font-semibold`, `gap-8` between sections, and card-style rows. Grouping by category (fasting, notifications, appearance, account) is the standard mobile settings pattern. Sign out goes at the bottom as a destructive action.

**Alternatives considered**:
- **Flat list without sections**: Less scannable, doesn't match epic-10 design.
- **Tabbed sections**: Overkill for 5 settings — adds navigation complexity.
