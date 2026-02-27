<!--
Sync Impact Report
Version change: 1.0.0 → 2.0.0
Modified principles: II. Security by Default (single-user → multi-user allowlist, up to 5)
Modified principles: V. Premium Simplicity (PRD v2.0 → v2.1 reference)
Templates requiring updates:
  ✅ plan-template.md — Constitution Check section present; gates align with 5 principles below
  ✅ spec-template.md — no structural changes required
  ✅ tasks-template.md — no structural changes required
Deferred TODOs: none
-->

# FastTrack Constitution

## Core Principles

### I. Mobile-First, Single-Interaction UX

Every user-facing feature MUST be reachable and operable on a 375px viewport without horizontal
scrolling. Core actions (start fast, stop fast) MUST complete in ≤ 2 taps from the home screen.
All interactive elements MUST meet a 44×44px minimum touch target (`min-h-11 min-w-11`). Flows
that require more than 3 taps to correct data (edit session times) are a design violation.

**Rationale**: FastTrack is a personal tool used on a phone in daily life. Friction in the
start/stop flow breaks the habit loop. Every added tap has a real cost.

### II. Security by Default

All routes except `/auth/*` and `/api/auth/*` MUST be protected by `middleware.ts`. Server
actions and API routes MUST verify the authenticated session via `auth()` before executing any
logic. All database queries MUST be scoped to the authenticated `userId` — no cross-user data
access is ever acceptable. Access MUST be restricted to up to 5 email addresses listed in
`AUTHORIZED_EMAILS` (comma-separated); any email not in the allowlist MUST be rejected at the
sign-in callback level. The middleware MUST re-validate the user's email against the allowlist
on every request, ensuring immediate revocation when an email is removed. Each user's data
MUST be fully isolated — no user can access another user's sessions, settings, or statistics.
No public-facing API endpoints MUST exist.

**Rationale**: This is a health data app shared by a small trusted group. A single unauthorized
access or cross-user data leak is an unacceptable failure. Defense must be layered (middleware +
action-level checks + per-user query scoping).

### III. Server-First Architecture

Pages and layouts MUST use React Server Components for initial data loading. Client Components
MUST only be introduced where interactivity is strictly required: live timer, charts, modals,
and form inputs. Mutations MUST use Next.js Server Actions — not client-side fetch calls to
REST endpoints. Data fetching for stats and paginated history MAY use API routes where Server
Actions are semantically inappropriate (GET semantics).

**Rationale**: Server components eliminate client JS for static content, keeping initial load
under 1.5s. They also keep auth checks server-side by default, supporting Principle II.

### IV. Data Integrity & Validation

Every mutation MUST validate inputs with Zod schemas both client-side (immediate feedback) and
server-side (authoritative). Session times MUST satisfy: `startedAt < endedAt`. Sessions MUST
NOT overlap for the same user (enforced server-side). Notes MUST be capped at 280 characters
at both UI and database (`@db.VarChar(280)`) levels. `FastingSession.endedAt` being `null` is
the canonical signal for an active fast — no other state flag MUST be introduced for this.

**Rationale**: Client-side validation provides UX feedback; server-side validation is the
security gate. Both are required. Inconsistent data (overlapping sessions, inverted times)
cannot be recovered from cleanly.

### V. Premium Simplicity

The UI MUST use the defined design token system (`--color-*`, typography scale, spacing scale)
— ad-hoc hex values and custom spacing MUST NOT be introduced. All entrance and celebration
animations MUST use the `motion-safe:animate-*` prefix. Error feedback animations (`animate-shake`)
MUST NOT use `motion-safe:` — they are functional, not decorative. Features MUST NOT be added
beyond the defined scope (see PRD v2.1 Section 11). Dark mode is the default; light mode is a
user-toggled preference stored server-side.

**Rationale**: Visual consistency and restraint are what make a personal tool feel trustworthy
and premium. Scope creep degrades both the UX and the codebase.

## Technical Stack

The following stack is fixed for v1.0. Substitutions require a constitution amendment.

| Layer | Technology | Locked Version Policy |
|-------|-----------|----------------------|
| Framework | Next.js 14+ App Router | Upgrade allowed; App Router MUST be retained |
| Deployment | Vercel | Non-negotiable — Postgres provisioned via Vercel |
| Auth | Auth.js (NextAuth.js v5) | v5 API shape required; do not downgrade to v4 |
| Database | Vercel Postgres (PostgreSQL) | Managed; schema managed via Prisma Migrate |
| ORM | Prisma | Migrations committed to Git |
| Styling | Tailwind CSS | Design tokens in `src/index.css` `@theme` block |
| Charts | Recharts | Client-side only |
| Icons | Lucide React | Do not mix icon libraries |
| Notifications | Browser Notification API | With in-app toast fallback |

**Package manager**: `npm` (Next.js ecosystem default for this project).

## Development Workflow

- **Branch strategy**: Feature branches off `main`; Vercel auto-deploys previews per PR.
- **Migrations**: `npx prisma migrate dev` locally; `npx prisma migrate deploy` in Vercel build
  (`postinstall` script). Migration files MUST be committed.
- **Environment secrets**: Stored in Vercel project settings only; never committed to Git.
  `.env.local` used locally and MUST be gitignored.
- **Epics**: Defined in `plans/epic-NN-*.md`. Each epic is a self-contained deliverable.
- **Spec workflow**: Features use the speckit workflow:
  `/speckit.specify` → `/speckit.plan` → `/speckit.tasks` → `/speckit.implement`.

## Governance

This constitution supersedes all other practices documented in this repository. Any decision
that contradicts a principle above MUST be resolved by amending this document first.

**Amendment procedure**:
1. Identify which principle(s) are affected and state the rationale for the change.
2. Increment `CONSTITUTION_VERSION` per semantic versioning (MAJOR: principle removal or
   redefinition; MINOR: new principle or section; PATCH: wording/clarification).
3. Update `LAST_AMENDED_DATE` to today's ISO date.
4. Update the Sync Impact Report comment at the top of this file.
5. Propagate changes to affected templates (`plan-template.md`, `spec-template.md`,
   `tasks-template.md`) and note their status in the Sync Impact Report.

**Compliance**: All implementation plans MUST include a Constitution Check section that maps
gates to principles I–V before Phase 0 research begins, and re-checks after Phase 1 design.

**Runtime guidance**: See `CLAUDE.md` at the repository root for agent-specific conventions.

**Version**: 2.0.0 | **Ratified**: 2026-02-22 | **Last Amended**: 2026-02-27
