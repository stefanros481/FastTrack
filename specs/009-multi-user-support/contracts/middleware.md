# Contract: Middleware (Per-Request Allowlist Validation)

**File**: `middleware.ts` (project root)
**Runtime**: Edge

## Behavior

Uses Auth.js `authorized` callback (already in `auth.config.ts`) to validate:
1. User is authenticated (has valid JWT session)
2. User's email is in the `AUTHORIZED_EMAILS` allowlist

### Updated `authorized` Callback

```
authorized({ auth }) {
  if (!auth) return false;                           // Not authenticated
  if (!auth.user?.email) return false;               // No email in token
  if (!isAuthorizedEmail(auth.user.email)) return false;  // Not in allowlist
  return true;                                       // Authorized
}
```

### Middleware Matcher

Protects all routes except:
- `/auth/*` (sign-in page)
- `/api/auth/*` (Auth.js API routes)
- `/_next/*` (Next.js internals)
- `/favicon.ico`, `/robots.txt` (static assets)

```
export const config = {
  matcher: ["/((?!auth|api/auth|_next|favicon.ico|robots.txt).*)"],
};
```

## Unauthorized Flow

When `authorized` returns `false`:
- Unauthenticated users → redirected to `/auth/signin`
- Authenticated but de-authorized users → redirected to `/auth/signin` (session cookie invalidated by Auth.js)
