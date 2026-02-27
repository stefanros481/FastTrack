# Contract: Dev Credentials Provider (Multi-User)

**File**: `src/lib/auth.config.ts` (provider) + `src/app/auth/signin/page.tsx` (UI)
**Runtime**: Node.js (development only)

## Updated Credentials Provider

The dev credentials provider accepts an `email` credential field:

```
Credentials({
  id: "dev-credentials",
  name: "Dev Login",
  credentials: {
    email: { type: "text" }
  },
  authorize(credentials) {
    const email = credentials?.email as string;
    if (!email || !isAuthorizedEmail(email)) return null;
    return {
      id: `dev-${email}`,
      email,
      name: `Dev (${email.split("@")[0]})`,
    };
  },
})
```

## Sign-In Page UI (Development Only)

Replaces the single "Dev Login" button with a form containing:
1. A `<select>` dropdown listing all emails from `getAuthorizedEmails()`
2. A "Dev Login" submit button

The form calls `signIn("dev-credentials", { email: selectedEmail, redirectTo: "/" })`.

**Visibility**: Only rendered when `process.env.NODE_ENV === "development"`.

**Design**: Follows existing button styling (amber-600 background, rounded-2xl, min-h-12). Dropdown uses matching border/radius styling.
