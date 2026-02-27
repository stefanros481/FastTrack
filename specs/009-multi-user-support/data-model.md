# Data Model: Multi-User Support

**Feature**: 009-multi-user-support
**Date**: 2026-02-27

## Schema Changes

**None required.** The existing Prisma schema already supports multiple users. All tables have `userId` foreign keys and queries are scoped by `userId`.

## Existing Entities (unchanged)

### User

| Field     | Type     | Constraints          | Notes                    |
|-----------|----------|----------------------|--------------------------|
| id        | String   | PK, cuid()           | Auto-generated           |
| email     | String   | Unique               | Matched against allowlist |
| name      | String?  | Optional             | From OAuth profile       |
| image     | String?  | Optional             | From OAuth profile       |
| createdAt | DateTime | Default: now()       |                          |
| updatedAt | DateTime | Auto-updated         |                          |

**Relationships**: Has many `FastingSession`, has one `UserSettings`

### UserSettings

| Field              | Type    | Constraints     | Notes                    |
|--------------------|---------|-----------------|--------------------------|
| id                 | String  | PK, cuid()      |                          |
| defaultGoalMinutes | Int?    | Optional        | Per-user default goal    |
| reminderEnabled    | Boolean | Default: false  |                          |
| reminderTime       | String? | Optional        | HH:mm format             |
| maxDurationMinutes | Int?    | Optional        |                          |
| theme              | String  | Default: "dark" | "dark" or "light"        |
| userId             | String  | Unique, FK      | One-to-one with User     |

### FastingSession

| Field       | Type      | Constraints    | Notes                          |
|-------------|-----------|----------------|--------------------------------|
| id          | String    | PK, cuid()     |                                |
| userId      | String    | FK, indexed    | Scopes all queries             |
| startedAt   | DateTime  | Required       |                                |
| endedAt     | DateTime? | Nullable       | null = active fast             |
| goalMinutes | Int?      | Optional       |                                |
| notes       | String?   | VarChar(280)   |                                |
| createdAt   | DateTime  | Default: now() |                                |
| updatedAt   | DateTime  | Auto-updated   |                                |

**Indexes**: `(userId, startedAt DESC)`, `(userId, endedAt)`

## New Configuration Entity (non-database)

### Authorized Email List

| Property   | Type       | Source                        | Notes                                       |
|------------|------------|-------------------------------|---------------------------------------------|
| emails     | string[]   | `AUTHORIZED_EMAILS` env var   | Comma-separated, max 5                      |
| fallback   | string[]   | `AUTHORIZED_EMAIL` env var    | Legacy single email, used if plural not set |

**Parsing rules**:
1. Split by comma
2. Trim whitespace from each entry
3. Convert to lowercase
4. Remove empty strings
5. Deduplicate
6. Take first 5 entries

**Lifecycle**: Parsed on every invocation (no caching) — env vars may change between deployments. Cost is negligible for ≤5 entries.

## Data Isolation Verification

All existing queries are already scoped by `userId`. Verified locations:

| File | Functions | Scoping |
|------|-----------|---------|
| `src/app/actions/fasting.ts` | startFast, stopFast, getActiveFast, getHistory, deleteSession, updateSession, updateNote, getStats | All use `getUserId()` → `where: { userId }` |
| `src/app/actions/settings.ts` | updateTheme, getTheme, getDefaultGoal, updateDefaultGoal | All use `getUserId()` → `where: { userId }` |
| `src/app/api/sessions/route.ts` | GET | `where: { userId: session.user.id }` |
| `src/app/api/stats/charts/route.ts` | GET | `where: { userId }` from session |

**Conclusion**: No data model or query changes needed. Multi-user isolation is already enforced at the data layer.
