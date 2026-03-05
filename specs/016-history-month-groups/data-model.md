# Data Model: History Month Groups

**Branch**: `016-history-month-groups` | **Date**: 2026-03-05

## Schema Changes

**None.** This feature introduces no new database tables, columns, or migrations. All grouping is performed client-side on already-fetched session data.

## Client-Side State

### Month Group (derived, in-memory only)

| Field | Type | Description |
|-------|------|-------------|
| monthKey | `string` (format: `"YYYY-MM"`) | Grouping key derived from session's `startedAt` date |
| displayLabel | `string` | Locale-formatted month label (e.g., "March 2026") |
| sessions | `CompletedSession[]` | Sessions belonging to this month, in existing sort order |

### Expanded State (in-memory only)

| Field | Type | Description |
|-------|------|-------------|
| expandedMonths | `Set<string>` | Set of `monthKey` values currently expanded |

**Default state**: Only the first (most recent) month key is in the set on initial load.

**State transitions**:

```
[Page Load] → expandedMonths = { firstMonthKey }
    ├── User taps collapsed month header → add monthKey to set
    ├── User taps expanded month header → remove monthKey from set
    └── Infinite scroll loads new month → set unchanged (new month starts collapsed)
```

### Grouping Derivation

```
Input:  CompletedSession[] (flat, sorted by startedAt desc)
Output: [monthKey, CompletedSession[]][] (grouped, same order preserved)

Algorithm:
  For each session in order:
    Extract monthKey = YYYY-MM from session.startedAt
    Append session to the group for that monthKey
  Result: Array of [monthKey, sessions[]] pairs in encounter order (reverse chrono)
```
