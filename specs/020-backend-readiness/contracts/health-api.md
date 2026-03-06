# API Contract: Health Check Endpoint

**Feature**: 020-backend-readiness
**Date**: 2026-03-06

## `GET /api/health`

Enhanced health check endpoint that validates full backend readiness (database schema + auth subsystem).

### Authentication

Required. Uses `auth()` to validate JWT session. Returns `401` if no valid session.

### Request

No query parameters or body.

### Response

#### 200 OK -- All subsystems healthy

```json
{
  "status": "ok",
  "checks": {
    "database": "ok",
    "auth": "ok"
  }
}
```

#### 503 Service Unavailable -- One or more subsystems unhealthy

```json
{
  "status": "error",
  "checks": {
    "database": "error",
    "auth": "ok"
  }
}
```

Possible combinations:

| database | auth | status | HTTP |
|----------|------|--------|------|
| ok       | ok   | ok     | 200  |
| error    | ok   | error  | 503  |
| ok       | error | error | 503  |
| error    | error | error | 503  |

#### 401 Unauthorized -- No valid session

```json
{
  "error": "Unauthorized"
}
```

### Subsystem Checks

| Check | Method | What it validates |
|-------|--------|-------------------|
| `auth` | `auth()` returns session with valid `user.id` | JWT session validity, NextAuth configuration, token signing |
| `database` | Prisma query against `User` table with `WHERE false` | DB connectivity, ORM layer, schema/migration integrity |

### Timeout

The endpoint itself does not enforce a timeout. The client enforces a 10-second `AbortController` timeout on the fetch request. If the server does not respond within 10 seconds, the client treats it as a failure.

### Client Polling Behavior

| Scenario | Interval | Action |
|----------|----------|--------|
| Initial load | Immediate | Single fetch on mount |
| After failure | Every 5 seconds | Retry until success |
| After success | None | Polling stops; retries cleared |

### Security Notes

- Response contains only status strings (`"ok"` / `"error"`), no PII or internal details.
- Auth is validated before any database query is executed.
- No user data is returned in the health check response.
