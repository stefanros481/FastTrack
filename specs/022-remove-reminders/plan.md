# Implementation Plan: Remove Reminder Functionality

**Branch**: `022-remove-reminders` | **Date**: 2026-03-11 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/022-remove-reminders/spec.md`

## Summary

Remove all reminder-related functionality (Daily Reminder toggle, Reminder Time picker, associated server actions, validation schemas, tests, and database fields) from the application. The Max Duration Alert feature in the Notifications section remains untouched.

## Technical Context

**Language/Version**: TypeScript 5 / Node.js 18+
**Primary Dependencies**: Next.js 16 (App Router), React 19, Prisma 7, Tailwind CSS v4, Zod 4
**Storage**: Vercel Postgres (PostgreSQL) via Prisma — removing `reminderEnabled` and `reminderTime` from `UserSettings` model
**Testing**: Manual verification (build succeeds, settings page functions correctly)
**Target Platform**: Vercel (web, mobile-first)
**Project Type**: Web application (Next.js App Router)
**Performance Goals**: N/A — removal only, no new functionality
**Constraints**: Migration must be non-destructive to other columns; Max Duration Alert must remain functional
**Scale/Scope**: 5 files modified, 1 component potentially deleted, 1 database migration

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Mobile-First, Single-Interaction UX | PASS | Removing UI elements only; remaining Notifications section unchanged |
| II. Security by Default | PASS | No new routes or endpoints; existing auth/scoping unchanged |
| III. Server-First Architecture | PASS | Removing server action; remaining actions follow same pattern |
| IV. Data Integrity & Validation | PASS | Removing unused validation schema; remaining schemas unchanged |
| V. Premium Simplicity | PASS | Removing unused feature reduces complexity — aligned with principle |

All gates pass. No violations to justify.

## Project Structure

### Documentation (this feature)

```text
specs/022-remove-reminders/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (files affected)

```text
# Files to MODIFY
src/components/NotificationSettings.tsx    # Remove reminder UI, keep Max Duration Alert
src/app/settings/page.tsx                  # Remove reminder props from NotificationSettings usage
src/app/actions/settings.ts                # Remove updateReminderSettings, update getNotificationSettings
src/lib/validators.ts                      # Remove reminderTimeSchema
src/__tests__/lib/validators.test.ts       # Remove reminderTimeSchema tests
prisma/schema.prisma                       # Remove reminderEnabled, reminderTime from UserSettings

# Files to DELETE (only used by reminder feature)
src/components/ui/wheel-time-picker.tsx    # Only imported by NotificationSettings for reminder time
```

**Structure Decision**: This is a removal feature — no new files or directories. All changes are modifications to existing files or deletion of now-unused components.
