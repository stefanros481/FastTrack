# Data Model: Authentication

**Branch**: `001-authentication` | **Date**: 2026-02-22

---

## Entities

### User

The single authorized person who owns and uses the app.

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| `id` | `String` | PK, `@default(cuid())` | App-internal identifier |
| `email` | `String` | `@unique`, NOT NULL | Google account email; must match `AUTHORIZED_EMAIL` |
| `name` | `String?` | nullable | Display name from Google profile |
| `image` | `String?` | nullable | Avatar URL from Google profile |
| `createdAt` | `DateTime` | `@default(now())` | First sign-in timestamp |
| `updatedAt` | `DateTime` | `@updatedAt` | Last profile update |

**Relations**:
- Has many `FastingSession` (defined in later epics)
- Has one `UserSettings` (1:1, created atomically on first sign-in)

**Uniqueness**: `email` is the natural key. The `id` (cuid) is used as the FK in all related tables.

**Lifecycle**:
1. Created on first successful Google OAuth sign-in
2. Updated (name, image) on subsequent sign-ins (via upsert)
3. Deletion cascades to `UserSettings` and all `FastingSession` records

---

### UserSettings

A 1:1 settings record tied to the User. Created with defaults on the same database operation as User creation.

| Field | Type | Constraints | Default | Notes |
|-------|------|-------------|---------|-------|
| `id` | `String` | PK, `@default(cuid())` | — | — |
| `userId` | `String` | `@unique`, FK → User | — | 1:1 enforced by @unique |
| `defaultGoalMinutes` | `Int?` | nullable | `null` | No default goal until user sets one |
| `reminderEnabled` | `Boolean` | NOT NULL | `false` | Daily reminder off by default |
| `reminderTime` | `String?` | nullable, HH:mm | `null` | Null until reminder enabled |
| `maxDurationMinutes` | `Int?` | nullable | `null` | No max duration until user sets one |
| `theme` | `String` | NOT NULL | `"dark"` | `"dark"` or `"light"` |

**Relations**:
- Belongs to one `User` via `userId`
- `onDelete: Cascade` — removed when User is removed

**Invariant**: A User record MUST always have a corresponding UserSettings record. This is enforced by creating them atomically in the same Prisma operation on first sign-in.

---

### Session (Conceptual — not a database table)

Auth.js JWT sessions are stateless. There is no `Session` table. The session is a signed JWT stored as an HTTP-only cookie on the client.

| Property | Value |
|----------|-------|
| Storage | HTTP-only cookie (client-side) |
| Strategy | JWT (stateless) |
| Expiry | 30 days from last visit (sliding) |
| Contents | `user.id`, `user.email`, `user.name`, `user.image` |
| Signing | `AUTH_SECRET` env var |

**Implication for sign-out**: Clearing the cookie on the client is sufficient to end the session. No server-side revocation is implemented.

---

## Prisma Schema

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  image     String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  settings  UserSettings?
  sessions  FastingSession[]
}

model UserSettings {
  id                 String   @id @default(cuid())
  defaultGoalMinutes Int?
  reminderEnabled    Boolean  @default(false)
  reminderTime       String?
  maxDurationMinutes Int?
  theme              String   @default("dark")

  userId             String   @unique
  user               User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

---

## Validation Rules

| Rule | Where enforced |
|------|---------------|
| `email` must match `AUTHORIZED_EMAIL` | Auth.js `signIn` callback (server-side) |
| `theme` must be `"dark"` or `"light"` | Zod schema in settings server action (later epic) |
| `reminderTime` must match `HH:mm` format | Zod schema in settings server action (later epic) |
| User + UserSettings created atomically | Prisma nested create in `signIn` callback |
| No duplicate User records | Prisma `upsert` on `email` field |
