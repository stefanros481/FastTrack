# Quickstart: Gamification Settings & Opt-In

## Prerequisites

- Node.js 18+, Bun installed
- Vercel Postgres database configured (`.env.local` with connection strings)
- Existing FastTrack app running locally

## Setup

```bash
# Switch to feature branch
git checkout 018-gamification-settings

# Install dependencies (if any new ones added)
bun install

# Run migration to add gamification fields
bunx prisma migrate dev --name add-gamification-settings

# Start dev server
bun run dev
```

## Verify

1. Open http://localhost:3000 -- splash screen should appear (gamificationEnabled is null for existing users)
2. Choose "Join In" or "No Thanks" -- splash disappears
3. Go to Settings -- Community section visible with master toggle and feature toggles
4. Toggle settings -- changes persist on page reload

## Reset for Re-Testing

```sql
-- Reset a user's gamification preference to trigger splash again
UPDATE "UserSettings" SET "gamificationEnabled" = NULL WHERE "userId" = '<user-id>';
```
