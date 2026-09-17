# FEATURE_PARITY_CHECKLIST.md — MLA vs. master refactor spec
Status values (from the master prompt): Implemented / Verified / Deferred / Blocked.
Evidence column cites what was actually seen/probed. Updates should be additive.

Legend:
- ✅ Implemented — code exists in repo (file shown)
- 🟢 Verified — tested live this session (HTTP 200 / REST read / migration present)
- ⚠️ Partial/Deferred — exists but intentionally paused per §1
- ⛔ Blocked — needs an owner action or credential (listed at bottom)

## 1. Blog / publishing dashboard (highest priority)
| Item | Status | Evidence |
|---|---|---|
| /admin/blog list + editor + new post | ✅ Implemented | app/admin/blog/page.tsx, …/new/page.tsx (+ /blog, /blog/[slug] 200) |
| Publishes without code, visual editor | ✅ Implemented | admin editor includes title, visual toolbar, categories, SEO fields (read this session) |
| Draft vs published separation + Update flow | ⚠️ Partial | editor present; draft-holds-public-until-Update needs a live test (owner test account) |
| Categories / tags / featured image / SEO | ✅ Implemented | fields present in admin editor route file |
| Media library (upload, alt, reuse, usage warn) | ⚠️ Partial | upload present in editor; full "used-in" tracking not evidenced |
| Scheduling | ⚠️ Deferred | not evidenced; doc §5 says don't claim until tested — mark Deferred |
| Comments moderation | ⚠️ Deferred | default off per spec — fine |
| Autosave / revisions / conflict detect | ⚠️ Partial | not evidenced in code; needs verification |
| Preview (auth, non-indexed) | ⚠️ Partial | editor has preview; indexing boundary not tested |
| Search / pagination / sitemap / OG | ⚠️ Partial | public list exists; sitemap/OG not directly evidenced |

## 2. LMS (courses)
| Item | Status | Evidence |
|---|---|---|
| Course catalogue + course detail | 🟢 Verified | /courses, /courses/[id] → 200 |
| Admin course creator (wizard) | ✅ Implemented | app/admin/courses/new/page.tsx |
| Curriculum, lessons, progress | ⚠️ Partial | routes exist; quiz/progress tests pending |
| Free vs paid course + Paystack | ⚠️ Blocked | needs Paystack TEST key + test user (no live charges) |
| Enrolment checked server-side | ⚠️ Blocked | needs entitlement/RLS test evidence |
| Certificates | ⚠️ Deferred | next slice, with verified completion only |

## 3. Digital shop
| Item | Status | Evidence |
|---|---|---|
| Shop catalogue + product page | 🟢 Verified | /shop, /shop/[id] → 200 |
| Admin product wizard | ✅ Implemented | app/admin/products/new/page.tsx |
| Cart / checkout / orders | ⚠️ Partial | /admin/orders 200 + routes exist; live purchase not run |
| Paystack webhook fulfillment idempotent | ⚠️ Blocked | needs webhook test with TEST keys |
| Private downloads with signed URLs | ⚠️ Blocked | design/Storage ready (0008) but no entitlement test run |
| My Downloads / Library | ✅ Implemented | app/dashboard/library exists (+200 cluster) |
| Watermarking | ⚠️ Deferred | per §19; not claiming until server-side copies actually built |

## 4. One identity / roles / security
| Item | Status | Evidence |
|---|---|---|
| Single login across blog+LMS+shop | 🟢 Verified | one Supabase auth; shared nav sign-in; /register /login 200 |
| Roles member/admin/superadmin; RLS | ✅ Implemented | profiles role field + RLS migrations 0003/0006 present |
| "Hidden button is not authorisation" | ⚠️ Partial | RLS + server checks exist; needs real cross-role tests |
| Admin cannot promote self / last superadmin safe | ⚠️ Partial | spec requires; dedicated test not yet run |
| Audit log | ✅ Implemented | 0010 enterprise audit ledger (git log + migration file) |
| Approval/pending member flow | ⚠️ Deferred | per §9; paused module |
| Device leases / lease DB-backed | ⚠️ Deferred | §18; needs isolated tests — not claimed |
| Paid URL protection tests | ⚠️ Blocked | requires test-mode Paystack + isolated users |

## 5. Deferred modules (preserved, not deleted)
| Module | Status | Note |
|---|---|---|
| Mentorship matching | ⚠️ Deferred | routes/data preserved; hidden from primary nav per §1 |
| Social/community/forums | ⚠️ Deferred | preserved; not in main nav |
| Mentorship cohort tiers | ⚠️ Deferred | preserved; not modifying existing terms |
| Events | ⚠️ Deferred | /events exists+200; not primary nav |
| Old mentorship/social nav links | 🟢 Verified | main nav prioritized: Home/Courses/Blog/Shop primary; Mentorship, Events, Hubs tucked under Community dropdown |

## Known honest gaps (do NOT classify as done)
1. **Paid-content protection tests** — ransom-quality RLS/payment/webhook tests with isolated
   users + Paystack TEST keys: NOT run. Blocked on TEST key.
2. **Brevo/API newsletter send** — a Brevo API key (`xkeysib-…`) is required; SMTP key is not
   sufficient. Blocked on key.
3. **Paystack live-key rotation** — old key was shared in a chat log; owner must regenerate in
   dashboard mirrors (Settings → API Keys). Blocked on owner.
4. **Super admin password change** — owner action at first login.
5. **Scheduling, autosave-revision conflict, watermark PDF generation** — code paths must be
   verified by real tests before being marked Implemented.

## NEXT SLICE (recommended, in order)
A. Blog editor live test (owner) → publish an article end-to-end using only the dashboard. (public free slice — can ship)
B. Paystack TEST key + test-mode pay → run §20 checks (course+purchase + download). (blocked until key)
C. Newsletter via Brevo API key (blocked until key)
D. Optional: onboarding screenshots + GETTING_STARTED checklist (needs live editor).

## Owner action list (batch)
- [ ] Rotate Paystack LIVE secret key (dashboard, 2 min) — real money key was in chat
- [ ] Change super admin password at first login
- [ ] Paste a Paystack TEST secret key (`sk_test_…`) so paid tests can actually run with test-mode
- [ ] Paste Brevo **API** key (`xkeysib-…`) for newsletter sends (SMTP key won't work for API)
- [ ] After tests: rotate ALL remaining secrets that ever appeared in chat
