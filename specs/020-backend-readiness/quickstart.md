# Quickstart: Backend Readiness Check

**Feature**: 020-backend-readiness
**Date**: 2026-03-06

## Prerequisites

- Node.js 18+
- Bun package manager
- Vercel Postgres database (Neon) configured
- `.env.local` with `DATABASE_URL_UNPOOLED`, `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `AUTHORIZED_EMAILS`

## What This Feature Changes

No new dependencies. No database migrations. Changes are limited to:

1. **Enhanced health check** (`src/app/api/health/route.ts`) -- replaces `SELECT 1` with application-table query + auth validation
2. **Connection context** (`src/contexts/ConnectionContext.tsx`) -- new React context providing connection status app-wide
3. **Updated hook** (`src/hooks/useConnectionStatus.ts`) -- adds timeout, retry counting, `"unavailable"` state
4. **Updated indicator** (`src/components/ConnectionStatus.tsx`) -- contextual messages for new states
5. **ConnectionGuard** (`src/components/ConnectionGuard.tsx`) -- new reusable wrapper that disables buttons + shows tooltip
6. **6 components updated** -- wrap write-action buttons with ConnectionGuard

## Development

```bash
# Start dev server
bun run dev

# Test health check manually
curl -v http://localhost:3000/api/health
# (requires authenticated session cookie)
```

## Testing Scenarios

### 1. Normal flow (database warm)
- Open app → should see "Connecting..." briefly → "Online" → auto-hides after 3s
- All buttons enabled

### 2. Database cold start (Neon wake-up)
- After 5+ minutes of inactivity, open app
- Should see "Connecting..." with yellow pulsing dot
- After DB wakes up (5-10s), transitions to "Online"

### 3. Persistent failure (unavailable)
- Simulate by temporarily changing `DATABASE_URL_UNPOOLED` to invalid value
- Should see "Connecting..." → after 3 failed retries (~15s) → "Unavailable" with red dot
- Write action buttons (Start Fast, settings saves, session edits) should be disabled
- Tapping a disabled button shows tooltip "System connecting, please wait..."

### 4. Recovery
- Fix the database URL and restart
- Retries continue every 5s → eventually succeeds → "Online"
- All buttons re-enabled

### 5. Timeout
- Simulate slow response (e.g., network throttling to >10s)
- Health check should timeout at 10s → treated as failure → "Offline"

### 6. End/cancel session while offline
- Start a fast while online, then simulate offline
- "End Session" / "Cancel" buttons should remain functional (not blocked)

## Files Modified

| File | Change |
|------|--------|
| `src/app/api/health/route.ts` | Deep health check (app table + auth) |
| `src/hooks/useConnectionStatus.ts` | Timeout, retry count, 4 states |
| `src/components/ConnectionStatus.tsx` | Contextual messages, "unavailable" state |
| `src/components/ConnectionGuard.tsx` | **New** -- disabled wrapper + tooltip |
| `src/contexts/ConnectionContext.tsx` | **New** -- React context for connection status |
| `src/app/layout.tsx` or equivalent | Wrap with ConnectionProvider |
| `src/components/FastingTimer.tsx` | Use context instead of direct hook; ConnectionGuard |
| `src/components/DefaultGoalSetting.tsx` | ConnectionGuard on goal buttons |
| `src/components/NotificationSettings.tsx` | ConnectionGuard on reminder controls |
| `src/components/GamificationSettings.tsx` | ConnectionGuard on toggles |
| `src/components/SessionDetailModal.tsx` | ConnectionGuard on Save/Delete |
| `src/components/NoteInput.tsx` | Block auto-save when not online |
