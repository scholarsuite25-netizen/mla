# OWNER_QUICK_START.md — publish something today, no code
For the MLA owner. Every route below is real (verified HTTP 200 against the live
deployment this session). Keep this file next to your browser.

## First time (one-time, ~10 min)
1. Go to **https://mla-snowy.vercel.app/register** → create your account.
2. The first account becomes admin via the existing migration. (Do this BEFORE inviting anyone.)
3. Sign in → a "Dashboard / Publish" button appears in the top nav.

## Write & publish a post (the "for tomorrow" path)
1. Click **Publish** in the nav (or go to **/admin/blog/new**).
2. Enter the **Title**. Body is a visual editor — type, paste from Word, add headings,
   bold/italic, lists, links, images (insert from your device or the media library).
3. Pick categories/tags on the right; add a **featured image** if you have one.
4. Set your **SEO/slug** (what shows in the URL) — defaults from the title.
5. Click **Save Draft** (private) or **Publish** (goes live immediately).

To update later: open the post from **/admin/blog** → edit → **Update** (keeps the old
public revision until you click Update — drafts never replace the live post on their own).

## Quick access to everything
| I want to… | Go to |
|---|---|
| Write a blog post | /admin/blog/new |
| Edit/manage posts | /admin/blog |
| Add a course | /admin/courses/new |
| Add a product (digital download) | /admin/products/new |
| See orders (shop) | /admin/orders |
| See members | /admin/members |
| My member account | /dashboard |
| My enrolments/downloads | /dashboard/learning, /dashboard/library |
| Shop (storefront) | /shop |
| Course catalogue | /courses |
| Latest articles | /blog |

## URLs that still work (do not delete)
- /blog, /blog/[slug] (read posts)
- /courses, /courses/[slug]
- /shop, /shop/[slug]
- /dashboard/* (account area)
- /admin/* (management area)

## Passwords & secrets (VERY IMPORTANT)
- Only you should know the **super admin password**. Change it at first login
  (Profile/Account → Password).
- **Paystack Live secret key** was discussed in a chat log — OPEN the Paystack dashboard,
  go to Settings → API Keys → SECRET KEY → Regenerate. Then tell the assistant the NEW key
  name only (never paste the key value anywhere in chat). This is a real-money key.
- Never paste keys into chat. Use Vercel → Project Settings → Environment Variables.

## Things being hidden but NOT deleted (do not re-enable without asking)
Mentorship matching, social/community feeds, forums, multi-membership tiers are being
moved out of the primary navigation and paused as first-class product areas. Their
existing member records, posts and payments are preserved; they are just not shown
in the main menu anymore. If you enabled events/mentorship, existing published
content is archived not deleted.

## Website is down or shows an error?
- Check https://mla-snowy.vercel.app returns a page.
- Check Vercel → your project → Deployments → latest build shows "Ready".
- Check Supabase Dashboard → Database → any failing migrations (they all end "LIVE").
- Most fixes below are additive SQL. Never run a destructive `drop` unless told.

## Media files (images, PDFs, video)
Publicly shown images/covers live in Supabase Storage. Paid digital products (ebooks,
videos) — original files go only in PRIVATE storage/bucket; the site serves them only
to the buyer, after payment, on a short-lived signed URL. A public "recap" table for
articles is already verified alive in the database (0008 ran). Where protection is not
supported (e.g., ordinary YouTube link for a paid item), that item must either stay
draft or be clearly marked "watch on YouTube" — do not promise it is unshareable.

## Rollback / safety
- All migrations up to now are additive (0001–0010). No destructive drops.
- Before any further risky production change: Supabase → Backup (point-in-time exists by
  default on paid plans) or export a restore point; verify the backup before applying.
- If a migration fails, tell the assistant the EXACT red error text from the SQL editor,
  do not re-run the whole file blindly.

## Honest limits (read once)
- Signed URLs are bearer credentials; they can be shared until they expire. We keep TTLs
  short and re-check ownership at delivery, but a signed link alone is not "account-tied".
- Watermarks/signed viewers deter casual sharing; they do not make copying impossible.
- We will never claim "100% piracy-proof". Reports show actual limits, not marketing.
