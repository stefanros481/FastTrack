# Quickstart: User Settings

## Setup

No additional setup required. All database fields already exist. No migrations needed.

## Testing Scenarios

### Scenario 1: Profile Display (US1)

1. Set `AUTHORIZED_EMAILS=alice@gmail.com,bob@gmail.com` in `.env.local`
2. Start dev server: `bun dev`
3. Sign in as alice via dev credentials dropdown
4. Navigate to `/settings`
5. **Verify**: Alice's name, email, and avatar initial are displayed at top
6. Sign out, sign in as bob
7. **Verify**: Bob's profile is shown, not Alice's

### Scenario 2: Theme Selection (US2)

1. Navigate to `/settings`
2. Current theme should be highlighted in the segmented control
3. Tap "Light" → **Verify**: entire app switches to light mode immediately
4. Tap "System" → **Verify**: app follows OS preference
5. Tap "Dark" → **Verify**: app returns to dark mode
6. Reload page → **Verify**: theme persists, no flash of wrong theme
7. Navigate to home → **Verify**: home page ThemeToggle shows matching theme

### Scenario 3: Default Goal (US3)

1. Navigate to `/settings`
2. Tap "16h" goal option → **Verify**: selection highlighted
3. Navigate to home, start a new fast → **Verify**: 16h goal pre-selected
4. Return to settings, tap "None" → **Verify**: goal cleared

### Scenario 4: Notification Preferences (US5)

1. Navigate to `/settings`
2. Toggle "Daily Reminder" on → **Verify**: time picker appears
3. Set time to 08:00 → **Verify**: saved
4. Set max duration to 24 hours → **Verify**: saved
5. Toggle "Daily Reminder" off → **Verify**: time picker hides, but value preserved
6. Toggle back on → **Verify**: 08:00 is still set

### Scenario 5: Sign Out (US4)

1. Navigate to `/settings`
2. Tap "Sign Out" → **Verify**: redirected to sign-in page
3. Try navigating to `/settings` directly → **Verify**: redirected to sign-in

### Scenario 6: Profile Image Fallback

1. Sign in with dev credentials (no Google image)
2. Navigate to `/settings`
3. **Verify**: Letter avatar shown (first letter of name/email) in a colored circle
4. **Verify**: No broken image icon visible

### Scenario 7: Multi-User Data Isolation

1. Sign in as alice, set theme to "light" and goal to 18h
2. Sign out, sign in as bob
3. Navigate to `/settings`
4. **Verify**: Bob's settings show defaults (dark theme, no goal), not Alice's
