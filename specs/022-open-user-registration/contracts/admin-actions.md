# Server Action Contracts: Admin User Management

**Feature**: 022-open-user-registration
**Date**: 2026-03-11

## File: `src/app/actions/admin.ts`

All actions require authenticated session with `role: "admin"`. Unauthorized calls return `{ error: "Unauthorized" }`.

---

### `getUsers()`

**Purpose**: List all registered users for the admin management screen.

**Input**: None (uses authenticated session)

**Output**:
```ts
{
  users: Array<{
    id: string
    email: string
    name: string | null
    image: string | null
    role: "admin" | "user"
    isActive: boolean
    createdAt: Date
  }>
  totalCount: number
  maxUsers: number  // from MAX_USERS env var
}
```

**Authorization**: Admin only.

---

### `deactivateUser(userId: string)`

**Purpose**: Deactivate a user, blocking their access on next request.

**Input**: `userId: string` (Zod validated)

**Validation**:
- Target user must exist
- Target user must not be the current admin (self-deactivation prevention)
- Target user must be currently active
- If target is admin: must not be the last admin

**Output**: `{ success: true }` or `{ error: string }`

**Side effect**: Sets `isActive: false` on the target User record.

---

### `reactivateUser(userId: string)`

**Purpose**: Reactivate a previously deactivated user.

**Input**: `userId: string` (Zod validated)

**Validation**:
- Target user must exist
- Target user must be currently inactive

**Output**: `{ success: true }` or `{ error: string }`

**Side effect**: Sets `isActive: true` on the target User record.

---

### `promoteToAdmin(userId: string)`

**Purpose**: Promote a regular user to admin role.

**Input**: `userId: string` (Zod validated)

**Validation**:
- Target user must exist
- Target user must have `role: "user"`
- Target user must be active

**Output**: `{ success: true }` or `{ error: string }`

**Side effect**: Sets `role: "admin"` on the target User record.

---

### `demoteFromAdmin(userId: string)`

**Purpose**: Demote an admin back to regular user role.

**Input**: `userId: string` (Zod validated)

**Validation**:
- Target user must exist
- Target user must have `role: "admin"`
- Target user must not be the last admin
- Target user must not be the current user (self-demotion of last admin prevention)

**Output**: `{ success: true }` or `{ error: string }`

**Side effect**: Sets `role: "user"` on the target User record.

---

## Auth Callback Changes

### `signIn` callback (in `src/lib/auth.ts`)

**New behavior**:
1. Check user count. If count >= `MAX_USERS` (env var, default 200) AND user email not already in DB → return `false` (redirect with `?error=RegistrationClosed`)
2. Upsert user: create with `role: "user"`, `isActive: true` if new; update `name`/`image` if existing
3. If this is the first user ever (count was 0 before upsert) → set `role: "admin"`
4. If existing user has `isActive: false` → return `false` (redirect with `?error=AccountInactive`)
5. Return `true`

### `authorized` callback (in `src/lib/auth.config.ts`)

**New behavior**:
1. If no auth session → return `false`
2. Query DB: `SELECT isActive FROM User WHERE email = ?`
3. If user not found OR `isActive: false` → return `false`
4. Return `true`

### `jwt` callback (in `src/lib/auth.ts`)

**New behavior** (additions):
- On sign-in: set `token.role = dbUser.role` and `token.isActive = dbUser.isActive`
- Existing `token.sub = dbUser.id` behavior unchanged
