# Quickstart: Authentication

**Branch**: `001-authentication` | **Date**: 2026-02-22

Steps to get the authentication feature running locally from scratch.

---

## Prerequisites

- Node.js 18+
- A Vercel Postgres database (or local PostgreSQL instance)
- A Google Cloud project with OAuth 2.0 credentials configured

---

## 1. Bootstrap the Next.js Project

```bash
npx create-next-app@latest fasttrack \
  --typescript \
  --tailwind \
  --app \
  --src-dir \
  --import-alias "@/*"
cd fasttrack
```

## 2. Install Dependencies

```bash
npm install next-auth@beta
npm install prisma @prisma/client
npm install --save-dev prisma
```

## 3. Configure Google OAuth

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project (or use existing)
3. Enable the **Google+ API** or **Google Identity** service
4. Create OAuth 2.0 credentials (Web application type)
5. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://your-vercel-domain.vercel.app/api/auth/callback/google` (production)
6. Copy the **Client ID** and **Client Secret**

## 4. Set Up Environment Variables

Create `.env.local` at the project root:

```bash
# Generate with: openssl rand -base64 32
AUTH_SECRET=your-generated-secret

# From Google Cloud Console
AUTH_GOOGLE_ID=your-client-id.apps.googleusercontent.com
AUTH_GOOGLE_SECRET=your-client-secret

# Your Google account email — the only one allowed to sign in
AUTHORIZED_EMAIL=you@gmail.com

# From Vercel Postgres dashboard (or local PostgreSQL)
POSTGRES_URL=postgresql://...
POSTGRES_URL_NON_POOLING=postgresql://...
```

## 5. Initialize Prisma

```bash
npx prisma init
```

Update `prisma/schema.prisma` with the User and UserSettings models (see `data-model.md`).

```bash
# Run the initial migration
npx prisma migrate dev --name init-auth
```

## 6. Implement Auth Files

Create these files in order:

1. `src/lib/prisma.ts` — Prisma client singleton
2. `src/lib/auth.ts` — Auth.js config with Google provider, signIn callback, JWT config
3. `src/app/api/auth/[...nextauth]/route.ts` — Route handler
4. `src/middleware.ts` — Export `auth` as default with matcher config
5. `src/app/auth/signin/page.tsx` — Custom sign-in page

## 7. Verify Locally

```bash
npm run dev
```

**Test checklist**:
- [ ] Navigate to `http://localhost:3000` — redirects to `/auth/signin`
- [ ] Click "Sign in with Google" — Google OAuth screen appears
- [ ] Sign in with your authorized email — lands on home page (`/`) **in under 10 seconds** (SC-001)
- [ ] Navigate to `http://localhost:3000` again — stays on home page (session persists)
- [ ] **Session persistence test (US2)**: Close the browser entirely, reopen it, navigate to `http://localhost:3000` — lands on home page without redirect to sign-in
- [ ] Sign in with a different Google account — error message "This app is private. Access denied." appears with shake animation
- [ ] Sign out from settings — redirects to `/auth/signin`
- [ ] Check database: `User` and `UserSettings` records created for your account
- [ ] **Fail-closed test**: Remove `AUTHORIZED_EMAIL` from `.env.local`, restart dev server, attempt sign-in — all sign-in attempts must be rejected (EC-003). Restore the value after confirming.

## 8. Verify Database

```bash
npx prisma studio
```

Confirm:
- One `User` record with your email, name, and image
- One `UserSettings` record linked to that User with default values (`theme: "dark"`, `reminderEnabled: false`)
