# Data Model: Fasting Goal

**Feature**: 005-fasting-goal
**Date**: 2026-02-26

## Existing Entities (No Schema Changes)

### FastingSession

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| id | String (cuid) | No | Primary key |
| userId | String | No | FK → User.id |
| startedAt | DateTime | No | Fast start time |
| endedAt | DateTime | Yes | Fast end time (null = active) |
| **goalMinutes** | **Int** | **Yes** | **Target duration in minutes (null = no goal)** |
| notes | String (280) | Yes | Session notes |
| createdAt | DateTime | No | Record creation |
| updatedAt | DateTime | No | Last update |

**Relevant behavior for this feature:**
- `goalMinutes` is set at fast start time via `startFast(goalMinutes?)` server action
- When `goalMinutes` is set, the progress ring displays; when null, timer shows elapsed time only
- Goal progress = `elapsedMinutes / goalMinutes` (clamped 0–1)
- Goal reached when `elapsedMinutes >= goalMinutes`

### UserSettings

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| id | String (cuid) | No | Primary key |
| userId | String (unique) | No | FK → User.id |
| **defaultGoalMinutes** | **Int** | **Yes** | **Pre-fill goal for new sessions (null = no default)** |
| reminderEnabled | Boolean | No | Default false |
| reminderTime | String | Yes | HH:MM format |
| maxDurationMinutes | Int | Yes | Safety cap |
| theme | String | No | Default "dark" |

**Relevant behavior for this feature:**
- `defaultGoalMinutes` pre-fills the goal selector when starting a new fast
- Read via `getDefaultGoal()` server action during SSR in `page.tsx`
- Written via `updateDefaultGoal(goalMinutes)` server action from settings page
- Value range: 60–4320 (1h–72h in minutes), or null to clear

## Validation Rules

| Rule | Schema | Context |
|------|--------|---------|
| Goal minutes range | `z.number().int().min(60).max(4320)` | 1–72 hours in minutes |
| Custom hours input | `z.number().min(1).max(72).positive()` | Converted to minutes × 60 |
| Default goal | Same as goal minutes, or `null` | Nullable for "no default" |

## State Transitions

### Goal Lifecycle (per session)

```
No Goal ──[user selects pill/custom]──→ Goal Set
Goal Set ──[start fast]──→ In Progress
In Progress ──[elapsed >= goalMinutes]──→ Goal Reached (notification fires)
In Progress ──[user stops fast]──→ Completed (goal not reached)
Goal Reached ──[user stops fast]──→ Completed (goal reached)
```

### Notification State (client-side ref)

```
Idle ──[goal set + fast active]──→ Monitoring
Monitoring ──[elapsed >= goalMinutes]──→ Notified (fire once)
Notified ──[new session starts]──→ Idle (ref reset)
```
