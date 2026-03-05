# Data Model: Database Connection Status Indicator

**Branch**: `015-connection-status` | **Date**: 2026-03-05

## Schema Changes

**None.** This feature introduces no new database tables, columns, or migrations. The health check uses a raw `SELECT 1` query against the existing database.

## Client-Side State

### ConnectionStatus (in-memory only)

| Field | Type | Description |
|-------|------|-------------|
| status | `"connecting" \| "online" \| "offline"` | Current connection state |

**State transitions**:

```
[Page Load] → "connecting"
    ├── health check succeeds → "online" (terminal, no further checks)
    └── health check fails → "offline"
                                └── retry every 5s → health check succeeds → "online"
```

**Lifecycle**:
- Initial state: `"connecting"` (set immediately on component mount)
- Transitions to `"online"` or `"offline"` based on health check response
- Once `"online"`, state is terminal — no further polling or transitions
- `"offline"` triggers periodic retries until success
