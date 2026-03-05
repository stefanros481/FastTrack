# API Contract: Health Check Endpoint

**Branch**: `015-connection-status` | **Date**: 2026-03-05

## `GET /api/health`

Verifies backend and database connectivity.

### Request

- **Method**: GET
- **Authentication**: Required (session cookie via Auth.js)
- **Body**: None

### Response

**200 OK** — Database is reachable

```json
{
  "status": "ok"
}
```

**401 Unauthorized** — No valid session

```json
{
  "error": "Unauthorized"
}
```

**503 Service Unavailable** — Database unreachable

```json
{
  "status": "error"
}
```

### Notes

- The endpoint executes `SELECT 1` against the database
- No caching (`Cache-Control: no-store` or `dynamic = "force-dynamic"`)
- Protected by auth middleware like all other API routes
