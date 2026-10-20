-- 0015_membership_notices_forum.sql
-- Adds Lifetime Membership, Membership Deals, Notice Board, and Community Forum

-- 1. Profiles: Lifetime Membership Columns
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_member BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS membership_tier TEXT DEFAULT 'lifetime',
ADD COLUMN IF NOT EXISTS membership_paid_at TIMESTAMPTZ NULL,
ADD COLUMN IF NOT EXISTS membership_reference TEXT NULL,
ADD COLUMN IF NOT EXISTS membership_amount NUMERIC DEFAULT 20000;

-- 2. Digital Products: Membership Deal Flag
ALTER TABLE public.digital_products
ADD COLUMN IF NOT EXISTS is_membership_deal BOOLEAN NOT NULL DEFAULT FALSE;

-- 3. Membership Payments Table
CREATE TABLE IF NOT EXISTS public.membership_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 20000,
  payment_method TEXT NOT NULL DEFAULT 'paystack', -- 'paystack' or 'bank_transfer'
  reference TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'paid', 'failed'
  transfer_proof_note TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.membership_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own membership payment"
ON public.membership_payments FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR auth.jwt() ->> 'email' = email);

CREATE POLICY "Service role full access on membership_payments"
ON public.membership_payments FOR ALL
TO service_role
USING (true);

-- 4. Notices & Announcements Table
CREATE TABLE IF NOT EXISTS public.notices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general', -- 'general', 'academic', 'membership', 'urgent', 'event'
  is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read published notices"
ON public.notices FOR SELECT
TO anon, authenticated
USING (is_published = true);

CREATE POLICY "Service role full access on notices"
ON public.notices FOR ALL
TO service_role
USING (true);

-- 5. Community Forum Categories
CREATE TABLE IF NOT EXISTS public.forum_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NULL,
  icon TEXT DEFAULT 'MessageSquare',
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.forum_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read forum categories"
ON public.forum_categories FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Service role full access on forum categories"
ON public.forum_categories FOR ALL
TO service_role
USING (true);

-- 6. Forum Threads
CREATE TABLE IF NOT EXISTS public.forum_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES public.forum_categories(id) ON DELETE CASCADE,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL,
  author_email TEXT NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  content TEXT NOT NULL,
  is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
  is_locked BOOLEAN NOT NULL DEFAULT FALSE,
  views_count INTEGER NOT NULL DEFAULT 0,
  replies_count INTEGER NOT NULL DEFAULT 0,
  last_activity_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_forum_threads_category ON public.forum_threads(category_id);
CREATE INDEX IF NOT EXISTS idx_forum_threads_activity ON public.forum_threads(last_activity_at DESC);

ALTER TABLE public.forum_threads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read forum threads"
ON public.forum_threads FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Authenticated users can create threads"
ON public.forum_threads FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authors or admin can update threads"
ON public.forum_threads FOR UPDATE
TO authenticated
USING (auth.uid() = author_id);

CREATE POLICY "Service role full access on forum threads"
ON public.forum_threads FOR ALL
TO service_role
USING (true);

-- 7. Forum Replies
CREATE TABLE IF NOT EXISTS public.forum_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES public.forum_threads(id) ON DELETE CASCADE,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL,
  author_email TEXT NULL,
  content TEXT NOT NULL,
  is_solution BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_forum_replies_thread ON public.forum_replies(thread_id);

ALTER TABLE public.forum_replies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read forum replies"
ON public.forum_replies FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Authenticated users can create replies"
ON public.forum_replies FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authors can update own replies"
ON public.forum_replies FOR UPDATE
TO authenticated
USING (auth.uid() = author_id);

CREATE POLICY "Service role full access on forum replies"
ON public.forum_replies FOR ALL
TO service_role
USING (true);

-- 8. Seed Default Forum Categories if empty
INSERT INTO public.forum_categories (name, slug, description, icon, display_order)
VALUES
  ('General Discussion', 'general-discussion', 'Open exchange of ideas, community welcomes, and scholarly discourse.', 'MessagesSquare', 1),
  ('Research & Publications', 'research-publications', 'Share research methodologies, journal submissions, citation practices, and academic monographs.', 'BookOpen', 2),
  ('Digital Wealth & AI', 'digital-wealth-ai', 'Discuss AI tools, Prompt Engineering, Vibe Coding, and turning digital skills into sustainable income.', 'Sparkles', 3),
  ('Leadership & Governance', 'leadership-governance', 'Executive discourse, university administration, registrar practices, and public service ethics.', 'Award', 4)
ON CONFLICT (slug) DO NOTHING;

-- 9. Seed Sample Initial Notice if none exists
INSERT INTO public.notices (title, slug, content, category, is_pinned, is_published)
VALUES
  ('Welcome to the Mentorship & Leadership Academy Digital Portal', 'welcome-to-mla-portal', 'We are pleased to introduce our comprehensive thought leadership library, one-time lifetime membership benefits (including 50% discount across all store publications and complimentary access to exclusive Membership Deals), and interactive academic forum.', 'general', true, true)
ON CONFLICT (slug) DO NOTHING;
