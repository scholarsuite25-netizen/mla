# REFACTOR_AUDIT.md — MLA refactor status (verified against live repo + production)

Date: 2026-09-18 (Africa/Lagos). All "verified" items were actually executed this session —
route probes returned HTTP 200, migrations inspected on disk, anon REST read confirmed against
the live Supabase project. Nothing here is inferred from the spec text alone.

## 1. What the attached master prompt requires (2-line)
Turn the existing MLA academy webapp into a **publication-first platform = Blog +
LMS courses + digital-product shop**, one identity/login across all three, three roles
(member / admin / superadmin), Paystack digital payments, and honest, server-enforced
protection of paid content. Publication dashboard ("publish without code") is priority #1
for tomorrow. Mentorship/social/forums/events are deferred and hidden, their records preserved.

## 2. Verified current state (evidence from this session)
- Public blog, courses, shop, mentor, admin, dashboard, register/login routes → all HTTP 200.
- `/admin/blog`, `/admin/blog/new`, `/admin/courses`, `/admin/products`, `/admin/shop`,
  `/admin/orders` → all HTTP 200 (dashboards exist).
- `event_recaps` table exists and is readable via anon REST → recap migration landed live.
- Migrations 0001–0010 present on disk (auth, profiles, RLS, blog, admin roles, mentorship,
  events, recaps, blog/LMS/shop layers).

## 3. Known gaps (honest, not hidden)
| Area | State | Required before "release" |
|---|---|---|
| Paystack key exposed in chat | UNROTATED | Owner rotates live sk_live… in Paystack dashboard |
| Brevo newsletter | SMTP key ≠ API key | Owner supplies xkeysib-… API key or defer |
| Paid-content protection tests | NOT yet run | Need test-mode Paystack + isolated test users |
| Super admin password | seeded & shared | Owner changes password after first login |
| Mentorship/social/forums in nav | still prominent | Hide from primary nav; keep records + routes |

## 4. Immediate owner actions (batch, no code needed)
1. Paystack → Settings → API Keys → Regenerate live key → paste new `sk_live_…` → I update Vercel.
2. Change super-admin password on first login.
3. (Optional) Brevo: use API key `xkeysib-…`, not the SMTP key already shared.

## 5. What is NOT claimed
- No "100% protection" or DRM-equivalent claims. Signed URLs are bearer credentials with
  bounded TTL; screenshot/recording cannot be prevented; watermarking is a deterrent.
- No claim that these docs alone implement protection. Protection requires the isolated
  payment + entitlement tests in item 3, which need owner-supplied test credentials.

## 6. Rollback / migration safety
- All migrations additive; no destructive drops in 0001–0010. Checkpoint available via git
  (working tree + remote). Restore = Supabase Dashboard → Backups (point-in-time) before
  applying any risky change. Do NOT reset production data.
