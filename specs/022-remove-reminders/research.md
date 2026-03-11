# Research: Remove Reminder Functionality

**Date**: 2026-03-11
**Feature**: 022-remove-reminders

## Findings

### 1. Reminder Functionality Scope

**Decision**: Remove all reminder-related code across UI, backend, validation, tests, and database schema.

**Rationale**: Reminders were never actively sent — no push notification infrastructure exists. The feature is dead code that adds maintenance burden.

**Alternatives considered**:
- Keep database columns but remove UI/backend (soft deprecation) — rejected because unused columns add confusion and Prisma schema drift
- Keep WheelTimePicker for potential future use — rejected because it's only imported by `NotificationSettings.tsx` for the reminder time picker; no other component uses it

### 2. WheelTimePicker Component

**Decision**: Delete `src/components/ui/wheel-time-picker.tsx` entirely.

**Rationale**: Grep confirms it is only imported by `NotificationSettings.tsx` (for the reminder time). The `WheelDateTimePicker` (`src/components/ui/wheel-date-time-picker.tsx`) is a separate component used for session editing and is unaffected.

**Alternatives considered**:
- Keep the file in case of future use — rejected per Premium Simplicity principle (V); dead code should not be preserved

### 3. Database Migration Strategy

**Decision**: Create a Prisma migration that drops `reminderEnabled` and `reminderTime` columns from `UserSettings`.

**Rationale**: Standard Prisma workflow — remove fields from schema, run `prisma migrate dev` to generate migration. The columns contain no data that needs preservation (reminders were never functional).

**Alternatives considered**:
- Keep columns as deprecated — rejected because it contradicts the removal goal and leaves schema drift

### 4. NotificationSettings Component

**Decision**: Simplify `NotificationSettings.tsx` to only contain the Max Duration Alert input. Remove reminder toggle, time picker, and associated state/handlers.

**Rationale**: The component still has purpose (Max Duration Alert). It becomes simpler with fewer props and less state management.

**Alternatives considered**:
- Inline Max Duration Alert directly in settings page — rejected because it would be a refactor beyond scope; the component abstraction is still useful
