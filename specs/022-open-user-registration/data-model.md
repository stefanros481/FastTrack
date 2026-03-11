# Data Model: Open User Registration

**Feature**: 022-open-user-registration
**Date**: 2026-03-11

## Entity Changes

### User (MODIFY existing model)

**New fields added to existing `User` model:**

| Field | Type | Default | Nullable | Description |
|-------|------|---------|----------|-------------|
| role | String | `"user"` | No | User role: `"admin"` or `"user"` |
| isActive | Boolean | `true` | No | Whether user can access the app |

**Complete User model after migration:**

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  image     String?
  role      String   @default("user")
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  settings UserSettings?
  sessions FastingSession[]
}
```

**Notes:**
- `role` is a String (not Prisma enum) for flexibility — values are `"admin"` and `"user"`.
- `isActive` defaults to `true` so new sign-ups get immediate access (open registration model).
- Existing users in the database will get `role: "user"` and `isActive: true` from the migration defaults — no access disruption.
- Email remains the unique identifier. No changes to relationships.

### Migration Details

**Migration name**: `add_user_role_and_active_status`

**SQL equivalent:**
```sql
ALTER TABLE "User" ADD COLUMN "role" TEXT NOT NULL DEFAULT 'user';
ALTER TABLE "User" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;
```

**Post-migration data update:**
- Find the earliest user by `createdAt` and set `role = "admin"`.
- This can be done via a one-time Prisma script or as part of the first sign-in flow.

### No Changes

The following models are **unchanged**:
- `FastingSession` — no schema changes
- `UserSettings` — no schema changes

## State Transitions

### User Lifecycle

```
[New Google Sign-In] → isActive: true, role: "user"
                         ↓
                   [Active User]
                    ↙        ↘
        [Admin promotes]    [Admin deactivates]
              ↓                    ↓
    role: "admin"          isActive: false
              ↓                    ↓
      [Active Admin]       [Inactive User]
              ↓                    ↓
    [Admin demotes]        [Admin reactivates]
              ↓                    ↓
    role: "user"           isActive: true
```

### Role Values

| Role | Permissions |
|------|------------|
| `"admin"` | All app features + user management (view users, deactivate, reactivate, promote, demote) |
| `"user"` | All app features (fasting, history, stats, settings). No user management access. |

### Active Status

| Status | Behavior |
|--------|----------|
| `isActive: true` | Full app access based on role |
| `isActive: false` | Blocked on every request. Redirected to sign-in with "account inactive" message. Data preserved. |

## Validation Rules

- `role` MUST be one of: `"admin"`, `"user"`. Validated via Zod in server actions.
- `isActive` MUST be boolean. No null.
- The last remaining admin cannot have their role changed or be deactivated (enforced in server actions, not at DB level).
- User cap (default 200 via `MAX_USERS` env) is checked at sign-in time before creating new users.

## Indexes

No new indexes required. The existing `email` unique index covers the `authorized` callback lookup. For the admin user list, a full table scan of up to 200 rows is acceptable.

## Session Token Changes

The JWT token will include:
- `sub`: User ID (existing)
- `role`: User role (new) — for fast admin checks in server components
- `isActive`: Active status (new) — supplementary; authoritative check is DB-based per request

The `Session` type augmentation will add:
- `session.user.role: string`
- `session.user.isActive: boolean`
