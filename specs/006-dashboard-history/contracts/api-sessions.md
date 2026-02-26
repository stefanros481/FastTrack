# API Contract: GET /api/sessions

**Feature**: 006-dashboard-history
**Date**: 2026-02-26

## Endpoint

```
GET /api/sessions
```

**Authentication**: Required (via `auth()` — returns 401 if unauthenticated)
**Scope**: Returns only sessions belonging to the authenticated user

## Request

### Query Parameters

| Parameter | Type | Required | Default | Description |
| --------- | ---- | -------- | ------- | ----------- |
| cursor | string | No | (none) | Session `id` to paginate from. Omit for first page. |
| pageSize | number | No | 20 | Number of sessions per page. Capped at 50. |

### Example Request

```
GET /api/sessions?pageSize=20
GET /api/sessions?cursor=cm1abc123def&pageSize=20
```

## Response

### 200 OK

```json
{
  "data": [
    {
      "id": "cm1abc123def",
      "startedAt": "2026-02-25T08:00:00.000Z",
      "endedAt": "2026-02-25T20:00:00.000Z",
      "goalMinutes": 960,
      "notes": "Felt great today"
    }
  ],
  "nextCursor": "cm1xyz789ghi",
  "hasMore": true
}
```

| Field | Type | Description |
| ----- | ---- | ----------- |
| data | Session[] | Array of completed sessions, sorted by `startedAt` descending |
| nextCursor | string \| null | Cursor for the next page; `null` if no more pages |
| hasMore | boolean | Whether additional pages exist |

### Session Object

| Field | Type | Nullable | Description |
| ----- | ---- | -------- | ----------- |
| id | string | No | Unique session identifier |
| startedAt | string (ISO 8601) | No | Fast start timestamp |
| endedAt | string (ISO 8601) | No | Fast end timestamp (always present — active fasts excluded) |
| goalMinutes | number | Yes | Target duration in minutes |
| notes | string | Yes | User note (up to 280 characters) |

### 401 Unauthorized

```json
{
  "error": "Unauthorized"
}
```

### 500 Internal Server Error

```json
{
  "error": "Internal server error"
}
```

## Behavior Notes

- Only completed sessions (`endedAt IS NOT NULL`) are returned.
- Results are sorted by `startedAt` descending (newest first).
- When `cursor` is provided, the cursor record itself is excluded (Prisma `skip: 1`).
- `pageSize` is clamped to a maximum of 50 to prevent excessive data transfer.
- If `pageSize` is not a valid number, defaults to 20.
- `hasMore` is `true` when `data.length === pageSize` (an additional query checks for more records).
