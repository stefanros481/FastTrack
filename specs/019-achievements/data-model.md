# Data Model: Achievements & Badges

**Feature**: 019-achievements | **Date**: 2026-03-06

## Overview

No database schema changes. All badge state is computed from existing `FastingSession` data. Badge definitions are application constants. Celebration-seen state is localStorage only.

## Entities

### Badge (Application Constant)

A milestone definition. Not stored in DB — defined as a TypeScript constant array.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique identifier, e.g. `"streak-3"`, `"volume-10"`, `"duration-18h"` |
| `category` | `BadgeCategory` | One of: `"streak"`, `"volume"`, `"duration"`, `"consistency"`, `"goals"` |
| `threshold` | `number` | Numeric threshold for earning (e.g., 3 for 3-day streak, 18 for 18h fast) |
| `label` | `string` | Display name, e.g. `"3-Day Streak"`, `"First 18h Fast"` |
| `description` | `string` | Unlock criteria text, e.g. `"Complete fasts on 3 consecutive days"` |
| `icon` | `LucideIcon` | Lucide icon component reference |

### BadgeCategory (Enum)

```typescript
type BadgeCategory = "streak" | "volume" | "duration" | "consistency" | "goals";
```

### Badge Definitions (Complete List)

| ID | Category | Threshold | Label | Description |
|----|----------|-----------|-------|-------------|
| `streak-3` | streak | 3 | 3-Day Streak | Fast 3 days in a row |
| `streak-7` | streak | 7 | Week Warrior | Fast 7 days in a row |
| `streak-14` | streak | 14 | Two-Week Titan | Fast 14 days in a row |
| `streak-30` | streak | 30 | Monthly Master | Fast 30 days in a row |
| `streak-60` | streak | 60 | Iron Will | Fast 60 days in a row |
| `streak-100` | streak | 100 | Century Streak | Fast 100 days in a row |
| `volume-10` | volume | 10 | Getting Started | Complete 10 fasts |
| `volume-50` | volume | 50 | Dedicated | Complete 50 fasts |
| `volume-100` | volume | 100 | Centurion | Complete 100 fasts |
| `volume-250` | volume | 250 | Veteran | Complete 250 fasts |
| `volume-500` | volume | 500 | Legend | Complete 500 fasts |
| `duration-18h` | duration | 18 | Extended Fast | Complete your first 18-hour fast |
| `duration-24h` | duration | 24 | Full Day | Complete your first 24-hour fast |
| `duration-100h` | duration | 100 | Century Hours | Accumulate 100 total fasting hours |
| `consistency-week` | consistency | 1 | Perfect Week | Fast every day of an ISO week |
| `consistency-month` | consistency | 1 | Perfect Month | Fast every day of a calendar month |
| `goals-10` | goals | 10 | Goal Getter | Meet your fasting goal 10 times |
| `goals-50` | goals | 50 | Goal Crusher | Meet your fasting goal 50 times |
| `goals-100` | goals | 100 | Goal Machine | Meet your fasting goal 100 times |

**Total badges**: 19

### ComputedBadgeState (Server Action Return Type)

Returned by the `getBadges()` server action. Contains all badge state for a single user.

| Field | Type | Description |
|-------|------|-------------|
| `earned` | `EarnedBadge[]` | Badges the user has unlocked |
| `progress` | `BadgeProgress[]` | Progress toward next unearned badge per category |

### EarnedBadge

| Field | Type | Description |
|-------|------|-------------|
| `badgeId` | `string` | References `Badge.id` |
| `earnedDate` | `string` | ISO date string of when the threshold was crossed (approximate — based on session dates) |

### BadgeProgress

| Field | Type | Description |
|-------|------|-------------|
| `category` | `BadgeCategory` | The badge category |
| `nextBadgeId` | `string \| null` | The next badge to earn (null if all earned in category) |
| `current` | `number` | Current count toward the threshold |
| `target` | `number` | Threshold of the next badge |

## Computation Logic

### Input Data

Single Prisma query — same pattern as `getStats()`:

```
prisma.fastingSession.findMany({
  where: { userId, endedAt: { not: null } },
  select: { startedAt, endedAt, goalMinutes },
  orderBy: { endedAt: "asc" },
})
```

### Category Computations

**Streak**: Build sorted unique dates from `endedAt`. Walk backwards from most recent date counting consecutive calendar days. Track best streak seen. Compare against thresholds [3, 7, 14, 30, 60, 100].

**Volume**: `sessions.length` compared against thresholds [10, 50, 100, 250, 500].

**Duration**:
- Single-session: For each session, compute `(endedAt - startedAt)` in hours. Check if any session >= 18h, >= 24h. Cap at 24h per FR-008.
- Cumulative: Sum all session durations. Check if total >= 100h.

**Consistency**:
- Build a `Set<string>` of ISO date strings (one per day with a completed session).
- Perfect Week: For each ISO week that has any session, check if all 7 days (Mon-Sun) are in the Set. Count perfect weeks.
- Perfect Month: For each calendar month that has any session, check if all days of that month are in the Set. Count perfect months.

**Goals**: Count sessions where `goalMinutes != null && duration >= goalMinutes`. Compare against thresholds [10, 50, 100].

## State Transitions

```
Session Completed → getBadges() recomputed on next Community tab view
                  → Client diffs earned badges against localStorage celebration list
                  → New badges trigger sequential celebration overlay
                  → User dismisses → badge ID added to localStorage
```

No state machine — badges are purely derived. The only mutable state is the localStorage celebration-seen array.

## Validation Rules

- No user input to validate — badges are read-only computed values.
- Duration thresholds capped at 24h max (FR-008).
- `getBadges()` must verify auth via `getUserId()` before any computation (Constitution Principle II).

## Existing Models (No Changes)

### FastingSession (read-only for this feature)

```prisma
model FastingSession {
  id          String    @id @default(cuid())
  userId      String
  startedAt   DateTime
  endedAt     DateTime?
  goalMinutes Int?
  notes       String?   @db.VarChar(280)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}
```

### UserSettings (read-only for this feature)

Relevant fields only:

```prisma
model UserSettings {
  gamificationEnabled      Boolean?
  gamificationAchievements Boolean  @default(true)
}
```

`gamificationEnabled` = `null` means user hasn't decided yet (show opt-in splash).
`gamificationEnabled` = `true` + `gamificationAchievements` = `true` → show Community tab and badges.
`gamificationEnabled` = `false` OR `gamificationAchievements` = `false` → hide badges UI.
