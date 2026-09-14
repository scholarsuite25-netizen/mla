# MLA — Mentorship and Leadership Academy — AI Build Prompt (SDLC-Structured)

> **Supersedes all earlier versions of this file.** Paste this entire document into OpenCode or Antigravity as your project brief. Work phase by phase, in order, and do not let the agent skip ahead before you've approved the current milestone (marked **STOP FOR APPROVAL**). The goal of this version is zero rework after launch — every foundational risk area (email, storage, backups, security, environment variables) is handled from Phase 0, not patched in later.

---

## 1. PROJECT OVERVIEW

**Product name:** MLA — Mentorship and Leadership Academy
**Domain:** https://mla.org.ng (already owned)

**One-line description:** A single web application where students, mentors, and staff from any Nigerian higher institution register under their institution, learn via a shared AI Literacy/Vibe Coding course library, read a blog, participate in self-service mentorship matching, attend events, and buy digital products (ebooks/software/PDFs) with license protection. One codebase; institutions are handled as data, not separate deployments. A community forum is deliberately deferred to a later, separate build.

**Core principle:** ONE application. A user selects their institution (or types a new one, created immediately) at registration. Institutions are isolated by database row-level security, not by subdomain or separate deployment.

**Roles:**
| Role | Scope | Permissions |
|---|---|---|
| **Super Admin** | Platform-wide | Only role that publishes/edits Blog posts and Courses. Gives final approval on mentorship matches. Manages the digital products shop. Promotes any member to Institution Admin, or approves a member's self-request for that role. Can suspend institutions/users. |
| **Institution Admin** | One institution | Approves/suspends/removes members of their own institution. Creates institution-scoped Events. Views (not edits) mentorship activity within their institution. Created either by Super Admin promotion or self-request + Super Admin approval. |
| **Member** | Self | Reads Blog/Courses, buys shop products, can list as mentor or request a mentor, RSVPs events, receives notifications (email + in-app) for new posts/courses, has their own personal dashboard. |

---

## 2. TECH STACK & SERVICE ACCOUNTS (all free-tier to start)

| Layer | Service | Why |
|---|---|---|
| Frontend/Backend | Next.js 15 (App Router), TypeScript, Tailwind CSS | Portable, no vendor lock-in |
| Database + Auth | Supabase (Postgres + Supabase Auth) | RLS gives real institution isolation |
| File storage (primary) | Supabase Storage | Course files, product files, images |
| File backup (secondary, disaster recovery) | Cloudflare R2 | S3-compatible, 10GB free, **zero egress fees** — nightly automated copy of Supabase Storage buckets, so a Supabase outage or accidental deletion doesn't mean lost files |
| Hosting | Vercel (Hobby tier) | Auto-deploy from GitHub, free SSL, custom domain support |
| Source control | GitHub (private repo) | Connected to Vercel for CI/CD |
| Transactional email | Resend | Account confirmations, password resets, license key delivery, mentorship approval notices. Free tier: 3,000/month, capped at 100/day, 1 domain — sized correctly because these are one-to-one triggered emails, not broadcasts. |
| Marketing/broadcast email | **Brevo** | THIS is your answer to "email marketing": Brevo's free plan sends up to 300 emails/day with no per-contact billing at your stage, so "new blog post" announcements to your whole member list work without the cost trap Resend's contact-based Marketing tier would create. Use Resend for triggered 1-to-1 email, Brevo for 1-to-many announcements. This split is intentional — do not combine them into one tool. |
| Payments | Paystack (already set up) | Nigerian bank/card coverage, one-off + recurring billing |
| Build agents | OpenCode / Antigravity | Execute this spec |

---

## 3. PHASE 0 — FOUNDATION & INFRASTRUCTURE SETUP (do this before any feature code is written)

This phase exists specifically so you do NOT have to revisit infrastructure decisions after launch. Follow in order.

**Step 1 — GitHub**
1. Create a GitHub account (if you don't have one) and a new **private** repository named `mla-platform`.
2. Give the AI agent access to push to this repo (or you accept each PR — your milestone-approval preference).

**Step 2 — Supabase**
1. Create a Supabase project (choose a region close to Nigeria — EU West is typically the lowest latency option currently offered).
2. In Project Settings → API, copy the Project URL, anon/public key, and service_role key. Treat the service_role key like a master password — it must NEVER appear in any client-side code or be committed to GitHub.
3. In Authentication → URL Configuration, set your Site URL to `https://mla.org.ng` and add `http://localhost:3000` as an additional redirect URL for local testing. (Forgetting this step is one of the most common reasons login "works locally but breaks in production" — it's called out here so the agent handles it in Phase 0, not as a bug later.)
4. Enable Row Level Security on every table as soon as it's created — never leave a table with RLS off "temporarily."

**Step 3 — Cloudflare R2 (backup)**
1. Create a free Cloudflare account, enable R2, create a bucket named `mla-backups`.
2. Generate an R2 API token (read/write scoped to this bucket only).
3. The agent will set up a scheduled job (Vercel Cron or Supabase Edge Function on a schedule) that copies new/changed files from Supabase Storage to this R2 bucket nightly.

**Step 4 — Resend (transactional email)**
1. Create a Resend account, verify your sending domain (e.g. `mail.mla.org.ng`) by adding the DNS records Resend provides to your domain registrar.
2. Copy the API key.

**Step 5 — Brevo (marketing email)**
1. Create a free Brevo account.
2. Verify a sender identity/domain the same way as Resend.
3. Copy the API key. The agent will use this exclusively for "new post/course published" broadcast emails, separate from Resend's transactional sends.

**Step 6 — Paystack**
1. You already have this — retrieve your **test mode** public + secret keys first for development; switch to live keys only after Phase 5 (Shop) passes its full test checklist.

**Step 7 — Vercel**
1. Create a Vercel account, import the GitHub repo.
2. Add every environment variable from Section 10 into Vercel's Project Settings → Environment Variables — for Production, Preview, AND Development environments. (A very common non-coder pitfall: adding env vars only to your local `.env.local` file, which never reaches the live Vercel deployment. The agent must confirm all variables exist in all three Vercel environments before Phase 1 is marked complete.)
3. Once Phase 1 has a working preview deploy, add `mla.org.ng` as a custom domain in Vercel and update your domain's DNS (A/CNAME records) as Vercel instructs. Confirm SSL is issued (usually automatic, can take up to an hour).

**STOP FOR APPROVAL** — do not proceed to Phase 1 feature work until every item above is confirmed working (a blank Next.js app deploys successfully to your live domain with HTTPS).

---

## 4. INSTITUTION HANDLING

- Typeahead search against `institutions` at registration; unmatched name → new row created immediately, active, no pending step.
- Every institution-scoped table carries `institution_id`; RLS enforces Institution Admin visibility to their own institution only.

## 5. INSTITUTION ADMIN CREATION (both paths)

1. **Super Admin promotes:** from the admin dashboard, select any member → "Make Institution Admin."
2. **Self-request:** a member clicks "Request to administer [Institution]" → creates a pending request → Super Admin approves/rejects from a queue.

## 6. NOTIFICATIONS

- On publish of a Blog post or Course:
  - **In-app** notification (bell icon, `notifications` table, read/unread)
  - **Email via Brevo** broadcast to all subscribed members (respecting the 300/day cap — queue and batch if the list exceeds that in one day)
- Transactional emails (registration confirmation, password reset, license key delivery, mentorship approval) go through **Resend**, never Brevo.
- Members can opt out of broadcast email without opting out of in-app notifications.

---

## 7. DATA MODEL (Supabase / Postgres)

1. `institutions` — id, name, created_at, is_active
2. `profiles` — id, full_name, role (super_admin/institution_admin/member), institution_id, email_notifications_enabled, created_at
3. `institution_admin_requests` — id, profile_id, institution_id, status (pending/approved/rejected)
4. `blog_posts` — id, title, slug, body, cover_image_url, published_at, status
5. `courses` — id, title, description, published_at, status
6. `course_modules` — id, course_id, title, content, order_index
7. `notifications` — id, profile_id, type, reference_id, message, is_read, created_at
8. `subscribers` — id, email, subscribed_at
9. `mentor_profiles` — id, profile_id, bio, expertise_tags, availability, is_active
10. `mentorship_requests` — id, mentee_id, mentor_id, institution_id, status, timestamps
11. `events` — id, institution_id (nullable = platform-wide), title, description, start_time, end_time, location_or_link, created_by
12. `event_rsvps` — id, event_id, profile_id, rsvp_status
13. `digital_products` — id, title, type (ebook/software/pdf), description, price, cover_image_url, file_url (private), status
14. `orders` — id, buyer_id, product_id, amount, paystack_reference, status
15. `product_licenses` — id, order_id, product_id, buyer_id, license_key, max_activations, activation_count, is_revoked
16. `license_activations` — id, license_id, device_fingerprint, activated_at
17. `audit_log` — id, actor_id, action, target_table, target_id, created_at (security requirement, see Section 9)

Schema for a future forum (`forum_categories`/`forum_threads`/`forum_replies`) is intentionally NOT built now — noted here only as a future roadmap pointer.

**STOP FOR APPROVAL** — review schema and every RLS policy before development begins. Ask the agent to show you the RLS policy for each table in plain English, not just SQL.

---

## 8. FUNCTIONAL REQUIREMENTS BY PHASE

### Phase 1 — Blog + Notifications + Core Navigation/Footer/Hero
- Public blog list/detail pages; Super Admin CMS (create/edit/publish, rich text, cover image via Supabase Storage)
- Notification system (in-app + Brevo broadcast) fires on publish
- Newsletter signup form (non-members) → `subscribers`
- Build the full site shell here (see Section 11 — Navigation, Hero, Footer) since every later phase depends on it — this avoids re-theming pages twice.

### Phase 2 — Courses (CMS)
Public/member course catalog; Super Admin creates courses + ordered modules; member progress tracking.

### Phase 3 — Mentorship
Self-service mentor listing → mentee request → mentor accepts → **Super Admin final approval** → both notified. Institution Admin: view-only.

### Phase 4 — Events
Institution Admin creates institution-scoped events; Super Admin creates platform-wide events. RSVP + list/calendar view.

### Phase 5 — Digital Products Shop
- Super Admin CMS for products; file uploaded to a **private** Supabase Storage bucket (never publicly listable)
- Checkout via Paystack; webhook verified with Paystack's signature before marking an order paid (see Security)
- On paid order: generate a signed `license_key` (HMAC using `LICENSE_KEY_SECRET`), set `max_activations` (default 2–3 devices), create `product_licenses` row, email the key via Resend
- Buyer's download page requires the license key; each new device fingerprint consumes one activation; block further activations at the limit (buyer can request a reset from Super Admin)
- PDFs/ebooks additionally watermarked with buyer name + email
- **Operator expectation to set correctly:** this is a strong deterrent, not unbreakable DRM — say so plainly to any customer who asks.

**STOP FOR APPROVAL after each phase**, using the Definition of Done checklist in Section 12.

### Future roadmap (not in this build)
- **Forum** — separate future build using the schema sketch above as a starting point.

---

## 9. SECURITY REQUIREMENTS (build in from Phase 0, not retrofitted)

- Row Level Security enabled and tested on every table — the agent must demonstrate a failed cross-institution access attempt during each phase's testing checklist.
- `SUPABASE_SERVICE_ROLE_KEY` used only in server-side code (API routes/server actions), never in any file bundled to the client.
- All Paystack webhook events verified using Paystack's signature header before being trusted — never mark an order paid based on the client-side redirect alone.
- License keys generated with an HMAC signature (using `LICENSE_KEY_SECRET`), not sequential/guessable IDs.
- All user input validated server-side with Zod, even when also validated client-side.
- File uploads restricted by type and size at the API layer (not just the file picker's `accept` attribute).
- Password policy enforced via Supabase Auth (minimum length; consider requiring a mix of character types).
- Basic rate limiting on auth endpoints (login/signup/password reset) to slow brute-force attempts — Vercel or Supabase Edge Function middleware.
- `audit_log` table records sensitive actions (role changes, license resets, order refunds) with actor and timestamp, so you can always answer "who did what."
- HTTPS enforced everywhere (automatic via Vercel once the custom domain's SSL is issued).
- Dependency updates: agent should note any flagged vulnerable packages at each phase's handoff, not silently ignore them.

---

## 10. ENVIRONMENT VARIABLES

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
BREVO_API_KEY=
CLOUDFLARE_R2_ACCESS_KEY_ID=
CLOUDFLARE_R2_SECRET_ACCESS_KEY=
CLOUDFLARE_R2_BUCKET=mla-backups
CLOUDFLARE_R2_ENDPOINT=
NEXT_PUBLIC_SITE_URL=https://mla.org.ng
SUPER_ADMIN_SEED_EMAIL=
PAYSTACK_SECRET_KEY=
PAYSTACK_PUBLIC_KEY=
LICENSE_KEY_SECRET=
```
Remember: every one of these must be added in Vercel's dashboard for Production, Preview, and Development — not just your local `.env.local` file.

---

## 11. DESIGN SYSTEM — DELIBERATELY NOT "THE USUAL AI-GENERATED LOOK"

**Explicit exclusions:** no navy blue, no cream-background-with-terracotta-accent SaaS template look, no identical rounded cards with soft grey shadows, no tracked-out ALL-CAPS eyebrow labels, no generic centered hero with gradient blob.

**Palette (deep academic/leadership tone — think a distinguished institution's crest and ceremonial colors, not a startup dashboard):**
| Token | Hex | Use |
|---|---|---|
| Ink (base background) | `#1B1410` | Primary dark background — warm near-black, not pure black or navy |
| Panel | `#2A211B` | Card/section backgrounds, subtly lighter than Ink |
| Crest Red | `#A13328` | Primary accent — CTAs, key headings, active states |
| Academy Gold | `#C9A227` | Secondary accent — dividers, icons, highlights, hover states |
| Parchment (text on dark) | `#F2EAD9` | Body text on dark backgrounds |
| Charcoal (text on light) | `#231B16` | Body text on light sections (e.g. forms, dashboards) |

**Typography:** A serif display face with genuine gravitas (e.g. Fraunces or Spectral) for headlines and the "MLA" wordmark — pairs with a clean, non-default sans (e.g. Sora or Work Sans) for body/UI text. Avoid Inter as the sole face; it is the most common AI-default choice.

**Navigation:** A mature multi-level menu, not a flat single row:
- **Home**
- **About** (Our Mission, Institutions)
- **Learn ▾** (Course Catalog, My Learning)
- **Mentorship ▾** (Find a Mentor, Become a Mentor, My Requests)
- **Blog**
- **Events**
- **Shop**
- Right-aligned: Login / Dashboard (avatar dropdown once logged in: My Dashboard, My Licenses, Settings, Log Out)

**Hero section:** Not a generic "big headline + gradient blob + two buttons." Ground it in the actual subject — leadership and mentorship in Nigerian higher education. Lead with a real, specific value statement (e.g. what a student gains, or a live counter of institutions/mentors on the platform) rather than a vague tagline. One deliberate visual moment (e.g. a subtle crest/path motif using the Gold accent), not scattered decorative elements.

**Footer (rich, not an afterthought):** Organize into clear columns:
- About MLA (short mission statement, link to About)
- Explore (Courses, Blog, Events, Shop)
- Mentorship (Find a Mentor, Become a Mentor)
- For Institutions (Join MLA, Request Institution Admin)
- Newsletter signup (feeds the `subscribers` table)
- Contact + social links
- Bottom bar: copyright, plus a small line noting which institutions are active on the platform (builds credibility)

**Process requirement for the agent:** before writing any UI code, produce a short design plan (palette, type, layout ASCII wireframe) using the tokens above and get it approved — do not silently drift back toward default template patterns partway through.

---

## 12. DEFINITION OF DONE — PER PHASE (use this to avoid post-launch iteration)

Before marking any phase complete, confirm ALL of the following:
- [ ] Feature works end-to-end on the live Vercel deployment (not just locally)
- [ ] All new environment variables added to Vercel (Production + Preview + Development)
- [ ] RLS policy tested with a cross-institution attempt that correctly fails
- [ ] Mobile responsiveness checked on a real phone or device emulator
- [ ] Notification(s) tested (in-app appears, Brevo/Resend email actually received)
- [ ] Any new form validated both client- and server-side
- [ ] Design matches the Section 11 tokens (no drift back to default AI-template styling)
- [ ] Manual test checklist for this phase provided in plain English and walked through by you personally
- [ ] For Phase 5 specifically: at least one full Paystack test-mode purchase completed, license key delivered, activation-limit enforcement verified, before switching to live keys

---

## 13. SDLC PROCESS FOR THE AGENT

1. **Requirements confirmation** — restate this spec in your own words; flag ambiguity before coding.
2. **Design** — folder structure, SQL migrations, route map, and the Section 11 design plan. STOP FOR APPROVAL.
3. **Development** — one Git branch + PR per phase, Vercel preview deploy before merge.
4. **Testing** — plain-English manual checklist per phase (Section 12).
5. **Deployment** — merge to `main` only after your approval.
6. **Maintenance handoff** — plain-English summary of what was built and what to check in each dashboard (Supabase, Vercel, Resend, Brevo, Paystack, Cloudflare R2).

---

## 14. OPERATOR (HUMAN) CHECKLIST BEFORE PHASE 1

- [ ] GitHub account + private repo
- [ ] Supabase project created, redirect URLs set, RLS habit confirmed
- [ ] Cloudflare account + R2 bucket + API token
- [ ] Resend account, domain verified
- [ ] Brevo account, sender verified
- [x] Paystack account already set up — retrieve test-mode keys first
- [ ] Vercel account connected to repo; all env vars added to all three environments
- [ ] `mla.org.ng` DNS updated once Phase 1 preview is live; SSL confirmed
- [ ] Decide seed Super Admin email/password
- [ ] Personally walk through each phase's Definition of Done checklist before approving
