# Epic 1: Authentication

Secure the app so only the owner can access it. All routes are protected by Auth.js middleware; the sign-in page is the only public surface.

**Stack:** Auth.js (NextAuth.js v5) · Google OAuth · JWT sessions · `middleware.ts`

**Env vars required:** `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `AUTHORIZED_EMAIL`, `POSTGRES_URL`, `POSTGRES_URL_NON_POOLING`

---

## US-1.0 — Secure sign-in

*As the app owner, I want to sign in with my Google account so that only I can access my fasting data.*

**Acceptance criteria:**
- Navigating to any page while unauthenticated redirects to `/auth/signin`
- Sign-in page shows a "Sign in with Google" button styled to match the premium aesthetic
- Only the email matching `AUTHORIZED_EMAIL` env var is allowed to sign in
- Any other email sees an error: "This app is private. Access denied."
- After successful sign-in, user is redirected to the home page
- A `User` record is created in the database on first sign-in (upsert)
- `UserSettings` record is created with defaults on first sign-in

**Design:**
- Page background: `bg-[--color-background]`
- Sign-in card: `bg-[--color-card]`, `rounded-2xl`, `p-4`, subtle `box-shadow`; entrance: `motion-safe:animate-fade-in`
- App headline: Display level — `text-3xl font-bold text-[--color-text]`
- "Sign in with Google" button: `bg-[--color-primary]`, `rounded-full`, `min-h-11 min-w-11` (44px touch target), hover → `bg-[--color-primary-dark]`
- Error message: `text-[--color-error]`, body text level (`text-base`); `animate-shake` (no `motion-safe:` — error feedback must always animate)

---

## US-1.1 — Sign out

*As a user, I want to sign out so that my session is terminated.*

**Acceptance criteria:**
- Sign-out option available in settings
- Clicking sign out clears the session cookie and redirects to `/auth/signin`

**Design:**
- Rendered as a destructive text button: `text-[--color-error]`, body text level, `min-h-11` touch target

---

## US-1.2 — Session persistence

*As a user, I want to stay signed in across browser sessions so that I don't have to log in every time.*

**Acceptance criteria:**
- JWT session lasts 30 days
- Closing and reopening the browser preserves the session
- Session is refreshed on each visit (sliding window)

---

**Key files:** `src/lib/auth.ts`, `src/middleware.ts`, `src/app/auth/signin/page.tsx`, `src/app/api/auth/[...nextauth]/route.ts`
