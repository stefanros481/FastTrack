This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

### 1. Environment Variables

Copy the template and fill in your values:

```bash
cp .env.local.example .env.local
```

| Variable | Where to get it |
|----------|----------------|
| `AUTH_SECRET` | Generate: `openssl rand -base64 32` |
| `AUTH_GOOGLE_ID` | [Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Credentials → OAuth 2.0 Client ID |
| `AUTH_GOOGLE_SECRET` | Same as above |
| `AUTHORIZED_EMAIL` | Your Google account email — the only address allowed to sign in |
| `POSTGRES_URL` | Vercel Postgres dashboard → your database → `.env.local` tab |
| `POSTGRES_URL_NON_POOLING` | Same as above (direct connection, used for migrations) |

**Google OAuth redirect URIs** — add these in Google Cloud Console under your OAuth client:
- Development: `http://localhost:3000/api/auth/callback/google`
- Production: `https://your-vercel-domain.vercel.app/api/auth/callback/google`

### 2. Database

```bash
bunx prisma migrate dev --name init-auth
```

### 3. Run the development server

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## Vercel Deployment

Set the following environment variables in your Vercel project settings (**Settings → Environment Variables**):

| Variable | Notes |
|----------|-------|
| `AUTH_SECRET` | Same value as local — do not reuse across projects |
| `AUTH_GOOGLE_ID` | From Google Cloud Console |
| `AUTH_GOOGLE_SECRET` | From Google Cloud Console |
| `AUTHORIZED_EMAIL` | Your Google account email |
| `POSTGRES_URL` | Auto-populated if you link a Vercel Postgres database |
| `POSTGRES_URL_NON_POOLING` | Auto-populated if you link a Vercel Postgres database |

> **Tip**: If you create a Vercel Postgres database and link it to your project, `POSTGRES_URL` and `POSTGRES_URL_NON_POOLING` are added automatically.

> **Security**: `AUTHORIZED_EMAIL` must **never** be prefixed with `NEXT_PUBLIC_` — it is server-side only.

---

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Auth.js Documentation](https://authjs.dev)
- [Prisma Documentation](https://www.prisma.io/docs)

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
