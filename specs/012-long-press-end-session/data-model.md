# Data Model: Long-Press Progress Ring to End Session

**Date**: 2026-02-28
**Feature**: 012-long-press-end-session

## Schema Changes

**None.** This feature is a pure frontend interaction change. No database schema modifications are required.

## Existing Entities Used

### FastingSession

The existing `FastingSession` model is used as-is. The `stopFast(sessionId)` server action sets `endedAt` to the current timestamp, which is the canonical signal for ending a fast. No new fields, relationships, or state transitions are introduced.

| Field | Type | Relevance |
|-------|------|-----------|
| `id` | String (cuid) | Passed to `stopFast()` when long-press completes |
| `startedAt` | DateTime | Used for elapsed time calculation and progress ring display |
| `endedAt` | DateTime? | Set by `stopFast()` — `null` means active session |
| `goalMinutes` | Int? | Determines progress ring percentage; `null` uses 16h default |

## Client-Side State

New transient state managed by the `useLongPress` hook (not persisted):

| State | Type | Description |
|-------|------|-------------|
| `progress` | `number` (0–1) | Current fill percentage of confirmation circle |
| `isPressed` | `boolean` | Whether user is actively holding the ring |
| `startTime` | `number \| null` | `performance.now()` timestamp of press start (internal to hook) |
| `rafId` | `number \| null` | `requestAnimationFrame` ID for cleanup (internal to hook) |
