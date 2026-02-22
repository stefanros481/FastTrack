# Research: Authentication

**Branch**: `001-authentication` | **Date**: 2026-02-22

---

## Decision 1: Auth.js v5 File Structure

**Decision**: Three-file structure — `src/lib/auth.ts` (config + exports), `src/app/api/auth/[...nextauth]/route.ts` (route handler), `src/middleware.ts` (protection).

**Rationale**: v5 changed the export model. The `NextAuth()` call now returns named exports (`auth`, `handlers`, `signIn`, `signOut`). Config and exports live in one file; the route handler just re-exports `handlers`. The middleware imports `auth` directly — no separate config object needed.

**Alternatives considered**: Separate `auth.config.ts` + `auth.ts` split (used when Prisma adapter is involved to avoid edge runtime issues). Not needed here since we're using JWT strategy with no database adapter — pure JWT, Prisma only touched in the `signIn` callback which runs in Node.js runtime.

---

## Decision 2: Email Restriction Pattern

**Decision**: Use the `signIn` callback. Return `false` for unauthorized emails; Auth.js will redirect to `/auth/error` by default but we configure `/auth/signin?error=AccessDenied` to keep the user on the sign-in page with the error visible.

**Rationale**: The `signIn` callback is the correct gate — it fires before the JWT is created. Returning `false` prevents any session from being established. The `AUTHORIZED_EMAIL` env var is checked server-side only; it MUST NOT be prefixed with `NEXT_PUBLIC_`.

**Pattern**:
```ts
// In signIn callback:
if (user.email !== process.env.AUTHORIZED_EMAIL) return false
return true
```

**Alternatives considered**: Checking in `jwt` callback — runs after sign-in is accepted, wrong gate. Checking in middleware — too late, session already created.

---

## Decision 3: JWT Session Configuration

**Decision**: `maxAge: 30 * 24 * 60 * 60` (30 days) + `updateAge: 24 * 60 * 60` (refresh every 24h). This implements sliding window — each visit within 24h resets the 30-day clock.

**Rationale**: Auth.js `updateAge` controls how frequently the JWT is reissued. Setting it to 24h means the token renews on any visit that day, effectively extending the 30-day window on each use.

**Alternatives considered**: Fixed expiry (no `updateAge`) — user gets logged out 30 days after first sign-in regardless of activity. Not appropriate for a daily-use personal tool.

---

## Decision 4: Middleware Protection Pattern

**Decision**: Use the `authorized` callback in the Auth.js config to protect all routes. Export `auth` as default from `src/middleware.ts`. Configure `matcher` to run on all paths except static assets and auth routes.

**Rationale**: The `authorized` callback approach is the simplest for blanket protection. Returning `!!auth` means "allow only if session exists". The matcher excludes `_next/static`, `_next/image`, `favicon.ico`, and `/api/auth/*` to avoid infinite redirect loops.

**Pattern**:
```ts
// src/middleware.ts
export { auth as default } from "@/lib/auth"
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/auth).*)"]
}
```

---

## Decision 5: First-Login User + UserSettings Creation

**Decision**: Use Prisma upsert with nested create in the `signIn` callback. UserSettings is created atomically in the same upsert `create` block. The `update` block only refreshes name and avatar — no UserSettings touch (settings are user-controlled after first login).

**Rationale**: Upsert is idempotent — satisfies FR-006. Nested create in a single Prisma operation is atomic without needing an explicit transaction. The `signIn` callback is the right place because we have access to the OAuth profile data (name, image) at that point.

**Pattern**:
```ts
await prisma.user.upsert({
  where: { email: profile.email },
  update: { name: profile.name, image: profile.image },
  create: {
    email: profile.email,
    name: profile.name,
    image: profile.image,
    settings: { create: { /* defaults */ } },
  },
})
```

**Alternatives considered**: Creating in the `jwt` callback — runs on every token refresh, not just sign-in. Using a separate transaction helper — adds complexity with no benefit since the nested create is already atomic.

---

## Decision 6: Prisma Client Singleton

**Decision**: Global singleton pattern — `global.prisma` reused in development to survive hot reloads; fresh instance in production (Vercel containers are single-use).

**Rationale**: Without the singleton, each serverless invocation in development creates a new connection and exhausts the pool quickly.

**Pattern**:
```ts
// src/lib/prisma.ts
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }
export const prisma = globalForPrisma.prisma ?? new PrismaClient()
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
```

---

## Decision 7: Vercel Postgres Connection Strings

**Decision**: `POSTGRES_URL` (pooled) for runtime queries; `POSTGRES_URL_NON_POOLING` as `directUrl` in `prisma/schema.prisma` for migrations.

**Rationale**: Vercel Postgres uses PgBouncer for connection pooling. Prisma migrations require a direct (non-pooled) connection. The `directUrl` field in the Prisma schema handles this transparently — no adapter needed.

**No adapter required**: `@prisma/adapter-neon` is only needed for Neon's serverless HTTP driver (edge runtime). Since we're using Node.js runtime (not edge) and Vercel Postgres's standard pooler, the standard `postgresql` provider works correctly.

---

## Decision 8: TypeScript Session Augmentation

**Decision**: Augment the `next-auth` module to add `id: string` to `Session.user`. This ensures `session.user.id` is typed throughout the app.

**Pattern**:
```ts
// src/lib/auth.ts (or types/next-auth.d.ts)
declare module "next-auth" {
  interface Session {
    user: { id: string } & DefaultSession["user"]
  }
}
```
