# Phase 0 operator checklist — what still needs YOUR hands

Everything code-level has been done. These steps need accounts/access only you
can perform. Each takes a few minutes.

- [ ] **1. Cloudflare R2 (backup target)**
      Create a free Cloudflare account -> Workers & Pages / R2 -> create bucket
      `mla-backups` -> API -> R2 API token (Object Read & Write, scoped to that
      bucket). Paste the 4 `CLOUDFLARE_R2_*` values into:
        - `.env.local` (yours),
        - Vercel project env vars (all 3 environments).
      The nightly backup job already exists (`app/api/cron/backup` +
      `vercel.json`). Confirm by opening
      `https://<your-vercel-app>/api/cron/backup` with header
      `Authorization: Bearer <CRON_SECRET>`.

- [ ] **2. Brevo (broadcast email)**
      Sign up free at brevo.com, verify sender domain, copy the API key.
      Set `BREVO_API_KEY`, `BREVO_SENDER_EMAIL`, `BREVO_SENDER_NAME=MLA`
      in Vercel (all 3 environments). Used only for "new post/course is live"
      announcements; Resend handles transactional mail.

- [ ] **3. Paystack test keys**
      Dashboard -> Settings -> API Keys. Copy test secret+public keys into
      `PAYSTACK_SECRET_KEY` / `PAYSTACK_PUBLIC_KEY` locally; switch to live
      keys only after the Phase 5 shop passes its checks.

- [ ] **4. Create the Super Admin account**
      - In Supabase -> Authentication -> Users -> Add user with your chosen
        super-admin email + a strong password.
      - Set `SUPER_ADMIN_SEED_EMAIL=<that email>` locally and in Vercel.
      - Run `npm run seed:super-admin` once (it promotes that user's profile
        to `super_admin`). Check Supabase -> Table Editor -> `profiles`.

- [ ] **5. Vercel auto-deploy**
      (I can run `vercel` for you — you just confirm the login.)
      - Link the repo, keep GitHub auto-deploy ON.
      - Add every key from `.env.example` to Vercel Project Settings ->
        Environment Variables for Production, Preview AND Development.
        (Local `.env.local` alone never reaches the live site.)
      - Set `mla.org.ng` as custom domain and update DNS per Vercel's
        instructions. Confirm SSL shows as valid.

- [ ] **6. Supabase Auth URLs**
      Project Settings -> Authentication -> URL Configuration:
      Site URL `https://mla.org.ng`, plus redirect URL `http://localhost:3000`
      for local dev. (Missing this is the #1 cause of "login works locally but
      broken in production".)

- [ ] **7. Confirm the cron fires**
      Vercel -> Settings -> Cron Jobs shows `/api/cron/backup` nightly at
      00:00 UTC once deployed.

## Local commands
```
npm run dev            # start the dev server
npm run db:migrate     # apply SQL migrations (idempotent)
npm run seed:super-admin
npm run lint           # lint check
npm run build         # production build check
```