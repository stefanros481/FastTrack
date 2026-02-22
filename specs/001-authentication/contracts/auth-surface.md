# Contract: Authentication Surface

**Branch**: `001-authentication` | **Date**: 2026-02-22

This document defines the public interface of the authentication system — what it exposes
to the rest of the application and what callers can depend on.

---

## 1. `auth()` — Session Helper

**File**: `src/lib/auth.ts` (re-exported from Auth.js)

**Usage context**: Server Components, Server Actions, API Route Handlers

**Signature**:
```ts
auth(): Promise<Session | null>
```

**Returns**:
- `Session` — if the request has a valid, non-expired JWT cookie
- `null` — if unauthenticated or session expired

**Session shape**:
```ts
interface Session {
  user: {
    id: string       // cuid — matches User.id in database
    email: string    // Google account email
    name: string | null
    image: string | null
  }
  expires: string    // ISO date string
}
```

**Contract guarantees**:
- `session.user.id` is always a non-empty string when session is non-null
- `session.user.email` always matches `AUTHORIZED_EMAIL` (enforced at sign-in)
- Callers MUST handle the `null` case — redirect or throw as appropriate

**Canonical usage in Server Action**:
```ts
const session = await auth()
if (!session) throw new Error("Unauthorized")
// proceed with session.user.id
```

---

## 2. Middleware Protection

**File**: `src/middleware.ts`

**Contract**: Every HTTP request to any path not matching the exclusion list below is
checked for a valid session. Unauthenticated requests are redirected to `/auth/signin`.

**Protected**: all paths by default

**Excluded from protection**:
```
/auth/*          — sign-in page and auth callbacks
/api/auth/*      — Auth.js route handler
/_next/static/*  — Next.js static assets
/_next/image/*   — Next.js image optimization
/favicon.ico
```

**Redirect behavior**: Unauthenticated requests to protected paths → `302` to `/auth/signin`.
The original path is NOT preserved as a `callbackUrl` (single-user app — always goes home).

---

## 3. Sign-In Page

**Route**: `GET /auth/signin`

**Visibility**: Public (excluded from middleware protection)

**UI contract**:

| State | Display |
|-------|---------|
| Default | "Sign in with Google" button |
| `error=AccessDenied` query param | Error message: "This app is private. Access denied." with `animate-shake` |
| OAuth provider error | Inline message: "Sign-in is temporarily unavailable. Please try again later." |

**Button behavior**: Initiates Google OAuth flow via Auth.js. On success → redirects to `/`.
On failure (unauthorized email) → returns to `/auth/signin?error=AccessDenied`.

---

## 4. Sign-Out Action

**Caller**: Settings page (`/settings`)

**Mechanism**: Auth.js `signOut()` server function

**Effect**: Clears the session cookie. No server-side revocation.

**Post-sign-out**: Redirects to `/auth/signin`.

---

## 5. Auth.js Route Handler

**Route**: `/api/auth/[...nextauth]`

**Methods**: `GET`, `POST`

**Visibility**: Public (required by OAuth callback flow)

**Contract**: Managed entirely by Auth.js. Do not add custom logic to this route.
All customization happens in `src/lib/auth.ts` callbacks.

---

## 6. Environment Variable Contract

All callers within the auth system depend on these being present at runtime:

| Variable | Required | Description |
|----------|----------|-------------|
| `AUTH_SECRET` | Yes | JWT signing secret. Generate: `openssl rand -base64 32` |
| `AUTH_GOOGLE_ID` | Yes | Google OAuth client ID |
| `AUTH_GOOGLE_SECRET` | Yes | Google OAuth client secret |
| `AUTHORIZED_EMAIL` | Yes | The single email allowed to sign in. Server-side only — MUST NOT be `NEXT_PUBLIC_` |
| `POSTGRES_URL` | Yes | Vercel Postgres pooled connection (runtime) |
| `POSTGRES_URL_NON_POOLING` | Yes | Direct connection for Prisma migrations |

**Fail-closed guarantee**: If `AUTHORIZED_EMAIL` is not set, `user.email !== undefined`
will be `false` for the comparison, which means **no email will ever match** and all
sign-in attempts will be rejected. The system fails closed by default.
