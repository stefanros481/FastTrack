# Data Model: Spinning Wheel Date/Time Picker

## Existing Entities (No Changes)

### FastingSession
- `id` (String, PK)
- `userId` (String, FK → User)
- `startedAt` (DateTime) — editable via new wheel picker for both active and completed sessions
- `endedAt` (DateTime, nullable) — editable via wheel picker for completed sessions only; null = active
- `goalMinutes` (Int, nullable)
- `notes` (String, nullable, max 280)

### UserSettings
- `userId` (String, PK/FK → User)
- `reminderEnabled` (Boolean, default false)
- `reminderTime` (String, nullable) — HH:MM format, editable via new wheel time picker
- `maxDurationMinutes` (Int, nullable)
- `defaultGoalMinutes` (Int, nullable)
- `theme` (String, default "system")

## Validation Rules

### Active Session Start Time Edit
- `startedAt` MUST be in the past (before current time)
- `startedAt` MUST NOT overlap with the previous completed session's time range
- Session MUST be active (`endedAt` IS NULL)

### Completed Session Edit (existing, unchanged)
- `startedAt` < `endedAt`
- Neither time in the future
- No overlap with other sessions

### Notification Reminder Time (existing, unchanged)
- Format: `HH:MM` (regex `^\d{2}:\d{2}$`)
- Hours: 00–23, Minutes: 00–59

## No Schema Migration Required

All fields already exist. This feature is UI-only with one new server action for active session start time editing.
