# Data Model: Backend Readiness Check

**Feature**: 020-backend-readiness
**Date**: 2026-03-06

## Schema Changes

**None.** This feature does not modify the database schema. All changes are to the health check API route, client-side hooks, and UI components.

Existing models used (read-only):
- `User` -- queried by health check to validate table accessibility
- `UserSettings` -- no direct interaction
- `FastingSession` -- no direct interaction

## Client-Side State

### ConnectionStatus (extended type)

```
ConnectionStatus = "connecting" | "online" | "offline" | "unavailable"
```

| State | Meaning | Trigger | Retry Active |
|-------|---------|---------|--------------|
| `connecting` | Initial state; first health check in flight | App load | No (first check pending) |
| `online` | All subsystems healthy | Health check returns 200 | No (retries stopped) |
| `offline` | Health check failed, < 3 consecutive failures | Fetch error or non-200, failCount < 3 | Yes (every 5s) |
| `unavailable` | Health check failed, >= 3 consecutive failures | failCount reaches 3 | Yes (every 5s) |

**State transitions:**

```
connecting ──(success)──→ online
connecting ──(failure)──→ offline
offline ────(success)──→ online
offline ────(fail, count≥3)──→ unavailable
unavailable ─(success)──→ online
unavailable ─(failure)──→ unavailable (stays, retries continue)
online ─────(re-check not applicable; retries stopped)
```

### Health Check Response Shape

```
{
  status: "ok" | "error",
  checks: {
    database: "ok" | "error",
    auth: "ok" | "error"
  }
}
```

HTTP status: `200` when `status === "ok"`, `503` otherwise.

### ConnectionGuard Tooltip State

Per-instance, component-local:
- `showTooltip: boolean` -- toggled on tap of disabled button, auto-dismissed after 2 seconds
