# MLA — Mentorship & Leadership Academy

A single web app for students, mentors, and staff of Nigerian higher
institutions: AI Literacy / Vibe Coding courses, blog, mentorship matching,
events, and licensed digital products — with institutions handled as data and
isolated by database Row Level Security.

## Stack

- **Next.js 15** (App Router, TypeScript, Tailwind CSS v4)
- **Supabase** — Postgres, Auth, Storage
- **Cloudflare R2** — nightly Storage backup
- **Resend** — transactional email (1-to-1)
- **Brevo** — broadcast email (1-to-many)
- **Paystack** — payments
- Hosted on **Vercel**

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in real values
npm run dev                  # http://localhost:3000
```

## Project map

| Path | Purpose |
|---|---|
| `app/` | Next.js App Router pages + API routes |
| `lib/supabase/` | Supabase browser/server/admin clients + session middleware |
| `lib/email/` | Resend (transactional) + Brevo (broadcast) helpers |
| `supabase/migrations/` | SQL migrations (applied via `npm run db:migrate`) |
| `scripts/` | migrate, verify-schema, seed:super-admin, r2-backup |
| `app/api/cron/backup` | nightly R2 backup endpoint (Vercel Cron) |
| `docs/RLS_POLICIES.md` | every security policy in plain English |
| `docs/OPERATOR_CHECKLIST.md` | Phase 0 account steps only you can do |

## Scripts

```bash
npm run dev                # dev server
npm run build              # production build
npm run lint               # lint
npm run db:migrate         # apply SQL migrations
npm run seed:super-admin   # promote SUPER_ADMIN_SEED_EMAIL to super_admin
```

## Security notes

- RLS is enabled on every table (see `docs/RLS_POLICIES.md`).
- `SUPABASE_SERVICE_ROLE_KEY` lives server-side only — never in client bundles.
- Secrets live in `.env.local` (gitignored) and Vercel env vars — never commit.