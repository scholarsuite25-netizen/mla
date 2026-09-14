# Row Level Security — explained in plain English

Every table in `supabase/migrations/0001_init.sql` has RLS enabled (57 policies).
Row Level Security means the database itself refuses to return or write rows the
current user is not allowed to see. The policies below define exactly who can do
what. "anon" = logged-out visitor, "authenticated" = signed-in user,
"super admin" / "institution admin" / "member" = the three role levels.

## institutions (the list of schools)
- Anyone (even logged out) can read the list and create a new institution.
  This is required for the registration typeahead: type a name, and if it
  doesn't exist it is created immediately.
- Only the super admin can edit institution rows (e.g. suspend a school).

## profiles (each person's account row)
- You can view and edit your own profile — but you CANNOT change your own role
  or institution; those can only be set by the super admin.
- A super admin can view and edit any profile (promoting/demoting admins).
- An institution admin can view all profiles **inside their own institution**
  and can update members there (e.g. suspend) — but cannot change roles, and
  cannot touch profiles in other institutions.

## institution_admin_requests (self-requests to administer a school)
- You can create a request for your own profile (always starts as "pending")
  and see your own request.
- Only the super admin can see all requests and approve/reject them.

## blog_posts
- Anyone can read published posts. Only the super admin can create, edit,
  publish, or delete posts. Drafts are invisible to everyone except the
  super admin.

## courses
- Published courses are readable by anyone; only the super admin manages them.

## course_modules
- A module is readable only if its course is published.
- Only the super admin creates/edits/reorders/deletes modules.

## notifications (bell icon)
- You can view your own notifications and mark them read.
- Notifications are written only by the server (service role) — no user can
  forge or delete them.

## subscribers (newsletter email list)
- Anyone can subscribe with an email address.
- Only the super admin can view or delete the list.

## mentor_profiles
- Active mentors are publicly visible.
- You can create/edit your own mentor profile, but only the super admin can
  activate/deactivate it.

## mentorship_requests
- You can send a request only as yourself (mentee), and it starts "pending".
- The mentee and the mentor can each see the request. The mentor can accept or
  reject it.
- Only the super admin can give final approval ("approved").
- An institution admin can VIEW requests involving mentors in their own
  institution (no edits).

## events
- Anyone can view events.
- An institution admin can create events only for their own institution, and
  only as themselves.
- The super admin can create platform-wide events (no institution) too.
- You can edit/delete only events you created.

## event_rsvps
- You can RSVP as yourself (going/maybe/declined) and change or cancel it.
- You can see RSVPs for events you created.

## digital_products (the shop catalogue)
- Published products are visible to everyone.
- Only the super admin manages products. The file itself is served from a
  PRIVATE storage bucket — never publicly listable.

## orders
- Buyers see their own orders. The super admin sees all orders.
- Orders are created/updated only by the server (Paystack webhook) —
  users cannot forge orders.

## product_licenses
- Buyers see their own licences (needed for the download page).
- Licences are created only by the server after a verified payment.

## license_activations
- Only the super admin (or the server) sees activations; users do not write
  directly — the server records device activations.

## audit_log ("who did what")
- The server writes every sensitive action (role changes, licence resets,
  refunds). Only the super admin can read it.

### Institutional isolation
Every institution-scoped table carries `institution_id`, and the policies above
ensure **institution admin A can never see institution B's rows** — the
database enforces it even if a bug in the UI tried to.