# Contract: Settings Server Actions

**File**: `src/app/actions/settings.ts`
**Runtime**: Node.js (server actions)

## Existing Actions (no changes)

### `getTheme(): Promise<string>`
Returns the user's theme preference. Defaults to `"system"`.

### `updateTheme(theme: string): Promise<void>`
Persists theme to `UserSettings.theme`.

### `getDefaultGoal(): Promise<number | null>`
Returns `UserSettings.defaultGoalMinutes` or null.

### `updateDefaultGoal(goalMinutes: number | null): Promise<void>`
Validates and persists default goal. Existing Zod validation applies.

## New Actions

### `getUserProfile(): Promise<{ name: string | null; email: string; image: string | null }>`

Fetches the current user's profile data from the `User` table.

- **Auth**: Requires authenticated session via `getUserId()`
- **Query**: `prisma.user.findUnique({ where: { id: userId }, select: { name, email, image } })`
- **Returns**: `{ name, email, image }`
- **Error**: Throws `"Unauthorized"` if no session; throws `"User not found"` if user doesn't exist

### `getNotificationSettings(): Promise<{ reminderEnabled: boolean; reminderTime: string | null; maxDurationMinutes: number | null }>`

Fetches the current user's notification preferences.

- **Auth**: Requires authenticated session
- **Query**: `prisma.userSettings.findUnique({ where: { userId }, select: { reminderEnabled, reminderTime, maxDurationMinutes } })`
- **Returns**: `{ reminderEnabled, reminderTime, maxDurationMinutes }`

### `updateReminderSettings(enabled: boolean, time: string | null): Promise<void>`

Updates daily reminder toggle and time.

- **Auth**: Requires authenticated session
- **Validation**:
  - `enabled`: boolean
  - `time`: if provided, must match `HH:MM` format (24-hour); if `enabled` is false, `time` is preserved as-is
- **Query**: `prisma.userSettings.update({ where: { userId }, data: { reminderEnabled: enabled, reminderTime: time } })`

### `updateMaxDuration(minutes: number | null): Promise<void>`

Updates max duration alert preference.

- **Auth**: Requires authenticated session
- **Validation**: If not null, must be between 60 and 4320 (1–72 hours)
- **Query**: `prisma.userSettings.update({ where: { userId }, data: { maxDurationMinutes: minutes } })`
