# Quickstart: Fasting Goal

**Feature**: 005-fasting-goal
**Date**: 2026-02-26

## Prerequisites

- Branch `005-fasting-goal` checked out
- `bun install` completed
- Database running with existing schema (no migrations needed)
- Environment variables configured (`.env.local`)

## Integration Points

### 1. Goal Selector → StartFast Action

**Where**: `GoalSelector.tsx` → `FastingTimer.tsx` → `startFast(goalMinutes)`

The new `GoalSelector` component emits a `goalMinutes` value (or null). `FastingTimer` passes this to the existing `startFast` server action, which already accepts an optional `goalMinutes` parameter.

**Verification**: Start a fast with a goal selected → check database record has `goalMinutes` set.

### 2. Progress Ring → Active Fast Timer

**Where**: `ProgressRing.tsx` inside `FastingTimer.tsx`

When an active fast has `goalMinutes`, the progress ring replaces the background fill animation. The ring calculates progress as `elapsed / goalMinutes` and displays HH:MM:SS inside.

**Verification**: Start a fast with a 1-minute goal → watch ring fill to 100% → see success animation.

### 3. Goal Notification → Browser + Toast

**Where**: `useGoalNotification.ts` hook used in `FastingTimer.tsx`

The hook monitors elapsed time vs goal. When goal is reached, it fires a Browser Notification (if permitted) and shows an in-app `Toast` component as fallback.

**Verification**: Start a fast with a short goal (1 min) → observe browser notification and/or toast.

### 4. Default Goal → Settings Page

**Where**: `DefaultGoalSetting.tsx` in `settings/page.tsx` → `updateDefaultGoal` server action

New settings UI allows selecting a default goal. Value is read during SSR in `page.tsx` and passed as prop to `FastingTimer`, which pre-fills the goal selector.

**Verification**: Set a default goal in settings → navigate to home → start a new fast → goal should be pre-selected.

## Quick Smoke Test

1. **No goal flow**: Start a fast without selecting a goal → should see normal elapsed timer (no ring)
2. **Goal flow**: Select "16h" pill → start fast → see progress ring with "16:00:00 to go"
3. **Custom goal**: Select "Custom" → enter "0.5" (30 min) → start fast → ring shows 30-minute goal
4. **Goal reached**: Use a 1-min custom goal → wait → see ring turn green, checkmark bounce, notification
5. **Default goal**: Go to Settings → set default to 18h → go home → "18h" pill should be pre-selected
6. **Build check**: `bun run build` should complete without errors
