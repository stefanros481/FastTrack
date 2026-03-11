# Quickstart: Open User Registration

**Feature**: 022-open-user-registration
**Date**: 2026-03-11

## Prerequisites

- Node.js 18+
- Bun package manager
- Vercel Postgres database (local or remote)
- Google OAuth credentials configured

## Environment Variables

**New variable:**
- `MAX_USERS` — Maximum number of registered users (default: `200`). Optional.

**Deprecated (no longer required):**
- `AUTHORIZED_EMAILS` — Fully ignored after this feature. Can be removed from Vercel project settings.
- `AUTHORIZED_EMAIL` — Same, fully ignored.

**Unchanged:**
- `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `fast_track_DATABASE_URL_UNPOOLED`

## Migration Steps

1. **Run Prisma migration:**
   ```bash
   bunx prisma migrate dev --name add_user_role_and_active_status
   ```

2. **Verify migration applied:**
   - All existing users get `role: "user"` and `isActive: true` from defaults.
   - No data loss or access disruption.

3. **Promote first admin:**
   - On fresh deploy: first user to sign in auto-becomes admin.
   - On existing deploy: earliest user (by `createdAt`) is promoted to admin via a one-time script or the first sign-in triggers the check.

4. **Remove `AUTHORIZED_EMAILS` from Vercel:**
   - Optional but recommended cleanup. The env var is fully ignored.

## Key Files Changed

| File | Change |
|------|--------|
| `prisma/schema.prisma` | Add `role`, `isActive` fields to User |
| `src/lib/auth.ts` | Update signIn/jwt callbacks for DB-driven auth |
| `src/lib/auth.config.ts` | Update authorized callback with DB active check |
| `src/lib/authorized-emails.ts` | DELETE |
| `src/types/next-auth.d.ts` | Add role, isActive to Session type |
| `src/app/auth/signin/page.tsx` | Remove env email list, add error messages |
| `src/app/settings/page.tsx` | Add admin section link |
| `src/app/settings/admin/page.tsx` | NEW — admin user management |
| `src/app/actions/admin.ts` | NEW — server actions for user management |
| `src/components/AdminUserList.tsx` | NEW — client component for user list |

## Testing Checklist

- [ ] New user can sign in with any Google account (no env var needed)
- [ ] First user on fresh deploy becomes admin automatically
- [ ] Existing users retain access after migration
- [ ] Admin can see user management in settings
- [ ] Admin can deactivate/reactivate users
- [ ] Deactivated user is blocked on very next request
- [ ] Admin can promote/demote users
- [ ] Last admin cannot be deactivated or demoted
- [ ] User cap is enforced (new sign-ups rejected at cap)
- [ ] Admin sees user count vs cap in management screen
- [ ] Dev login still works in development mode
