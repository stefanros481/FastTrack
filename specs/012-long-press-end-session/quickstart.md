# Quickstart: Long-Press Progress Ring to End Session

**Date**: 2026-02-28
**Feature**: 012-long-press-end-session

## Prerequisites

- Node.js 18+
- Bun package manager
- Local `.env.local` with database and auth credentials

## Setup

```bash
git checkout 012-long-press-end-session
bun install
bun run dev
```

No database migrations needed — this is a frontend-only change.

## What Changed

### New Files
- `src/hooks/useLongPress.ts` — Custom hook for long-press gesture detection via Pointer Events

### Modified Files
- `src/components/ProgressRing.tsx` — Added confirmation circle (red SVG arc), text hints, long-press event handling, sr-only accessible fallback button
- `src/components/FastingTimer.tsx` — Removed "End Fast" button and confirm flow; always renders ProgressRing for active sessions

## Testing

1. Start a fast (with or without a goal)
2. Verify a progress ring is always shown
3. Verify "Hold ring to end" hint text is visible below the ring
4. Press and hold the ring — observe the red confirmation circle filling over 5 seconds
5. Release before 5 seconds — confirm the session continues and the circle resets
6. Hold for the full 5 seconds — confirm the session ends
7. Verify there is no "End Fast" button anywhere
8. Test keyboard accessibility: Tab to the hidden "End session" button and activate it
