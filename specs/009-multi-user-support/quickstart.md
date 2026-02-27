# Quickstart: Multi-User Support

**Feature**: 009-multi-user-support

## Prerequisites

- Existing FastTrack deployment with single-user auth working
- Access to `.env.local` (local) or Vercel project settings (production)

## Local Development Setup

### 1. Update `.env.local`

```env
# Replace AUTHORIZED_EMAIL with AUTHORIZED_EMAILS (plural)
# Comma-separated, up to 5 emails
AUTHORIZED_EMAILS=alice@example.com,bob@example.com,charlie@example.com
```

The old `AUTHORIZED_EMAIL` (singular) still works as a fallback, so existing setups don't break.

### 2. Start the dev server

```bash
bun run dev
```

### 3. Test multi-user sign-in

1. Open `http://localhost:3000/auth/signin`
2. In development mode, a dropdown appears with all authorized emails
3. Select an email and click "Dev Login"
4. Verify you see only that user's data
5. Sign out, select a different email, sign in again
6. Verify data isolation — each user sees only their own sessions

## Production Deployment

### 1. Update Vercel Environment Variables

In Vercel project settings → Environment Variables:

1. Add `AUTHORIZED_EMAILS` with comma-separated emails (up to 5)
2. Optionally remove `AUTHORIZED_EMAIL` (singular) — the system falls back gracefully

### 2. Deploy

```bash
git push origin main  # Vercel auto-deploys
```

No database migration needed — the schema already supports multiple users.

## Verification Checklist

- [ ] Multiple authorized emails can sign in independently
- [ ] Unauthorized emails are rejected with "This app is private. Access denied."
- [ ] Each user sees only their own fasting sessions, stats, and settings
- [ ] Removing an email from `AUTHORIZED_EMAILS` immediately revokes access (next page load)
- [ ] Dev login dropdown shows all authorized emails
- [ ] Existing single-user data preserved after migration
