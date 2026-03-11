# Data Model: Remove Reminder Functionality

**Date**: 2026-03-11
**Feature**: 022-remove-reminders

## Schema Changes

### UserSettings Model — Fields to Remove

| Field | Type | Default | Action |
|-------|------|---------|--------|
| `reminderEnabled` | `Boolean` | `false` | DROP column |
| `reminderTime` | `String?` | `null` | DROP column |

### UserSettings Model — After Migration

```
UserSettings
├── id                        String    @id @default(cuid())
├── defaultGoalMinutes        Int?
├── maxDurationMinutes        Int?
├── theme                     String    @default("dark")
├── gamificationEnabled       Boolean?
├── gamificationAchievements  Boolean   @default(true)
├── gamificationWhosFasting   Boolean   @default(true)
├── gamificationLeaderboard   Boolean   @default(true)
├── gamificationChallenge     Boolean   @default(true)
├── userId                    String    @unique
└── user                      User      @relation(...)
```

### Migration Notes

- Migration type: **destructive** (column drop) — data in `reminderEnabled` and `reminderTime` is discarded
- No data backup needed — reminder feature was never functional (no push notification infrastructure)
- Migration is irreversible — standard for column drops
- No other models affected — only `UserSettings` changes

## Removed Contracts

### Server Action: `getNotificationSettings`

**Before** (returns 3 fields):
```typescript
{ reminderEnabled: boolean; reminderTime: string | null; maxDurationMinutes: number | null }
```

**After** (returns 1 field):
```typescript
{ maxDurationMinutes: number | null }
```

### Server Action: `updateReminderSettings` — DELETED entirely

### Validation Schema: `reminderTimeSchema` — DELETED entirely

### Component Props: `NotificationSettings`

**Before**:
```typescript
{ reminderEnabled: boolean; reminderTime: string | null; maxDurationMinutes: number | null }
```

**After**:
```typescript
{ maxDurationMinutes: number | null }
```
