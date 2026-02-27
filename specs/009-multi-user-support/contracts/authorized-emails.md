# Contract: Authorized Emails Utility

**Module**: `src/lib/authorized-emails.ts`
**Runtime**: Edge-compatible (no Node.js-only APIs, no Prisma)

## Function: `getAuthorizedEmails(): string[]`

Returns the parsed list of authorized email addresses.

**Behavior**:
1. Read `process.env.AUTHORIZED_EMAILS` (comma-separated)
2. If empty/undefined, fall back to `process.env.AUTHORIZED_EMAIL` (singular)
3. If both empty/undefined, return empty array `[]`
4. Split by comma, trim whitespace, convert to lowercase
5. Remove empty strings after trimming
6. Deduplicate (preserve first occurrence order)
7. Take first 5 entries (silently ignore remainder)

**Returns**: `string[]` — 0 to 5 lowercase, trimmed email addresses

**Examples**:
```
AUTHORIZED_EMAILS="alice@example.com, Bob@Example.com, alice@example.com"
→ ["alice@example.com", "bob@example.com"]

AUTHORIZED_EMAILS="" + AUTHORIZED_EMAIL="legacy@example.com"
→ ["legacy@example.com"]

Neither set
→ []
```

## Function: `isAuthorizedEmail(email: string): boolean`

Checks if a given email is in the authorized list.

**Parameters**: `email: string` — the email to check

**Behavior**:
1. Call `getAuthorizedEmails()`
2. Compare `email.toLowerCase().trim()` against the list
3. Return `true` if found, `false` otherwise

**Returns**: `boolean`
