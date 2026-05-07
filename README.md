# Thaali Rotation Manager

Zone coordinator platform for managing thaali rotations, member rosters, and reminder emails.

## What’s implemented

- **Auth**: Google OAuth via NextAuth v5 + `SUPER_ADMIN_EMAIL` role
- **Admin**: zones CRUD + coordinators allowlist (drives coordinator login)
- **Coordinator**: dashboard, members, rotations calendar, notifications, auto-assign
- **Email**: manual reminders (date range) via Resend + React Email template
- **Cron**: Vercel Cron hits `/api/cron/reminders` hourly (acts at 09:00 UTC)
- **Branding**: `public/logo.png` + `src/app/icon.png` + `src/app/opengraph-image.png`

## Local setup

1) Install deps

```bash
npm install
```

2) Configure env

```bash
cp .env.example .env.local
```

Fill in:
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
- `SUPER_ADMIN_EMAIL`
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (server-only), `SUPABASE_PUBLISHABLE_KEY`
- `RESEND_API_KEY`, `FROM_EMAIL`
- `CRON_SECRET` (optional, recommended)

3) Run dev server

```bash
npm run dev
```

## Database

- Schema + RLS migration lives at `supabase/migrations/20260506185832_init_schema.sql`.
- Supabase project ref: `mrqhiirimirdoynvgimt` (Thaali Rotation Manager)

## Deploy (Vercel)

- `vercel.json` includes an hourly cron for `/api/cron/reminders`.
- Set production env vars to match `.env.example`.
