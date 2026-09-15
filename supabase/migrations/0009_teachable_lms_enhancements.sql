-- 0009_teachable_lms_enhancements.sql
-- Adds Teachable-grade LMS features: course metadata, video lectures, lesson types, duration, free previews, and resources.

-- 1. Extend courses table
alter table public.courses
  add column if not exists cover_image_url text,
  add column if not exists category text not null default 'Executive Leadership',
  add column if not exists level text not null default 'Intermediate',
  add column if not exists estimated_duration text not null default '4 Weeks',
  add column if not exists instructor_name text not null default 'MLA Faculty & Mentors',
  add column if not exists instructor_title text not null default 'Executive Leadership Fellow',
  add column if not exists certificate_enabled boolean not null default true,
  add column if not exists featured boolean not null default false;

create index if not exists courses_category_idx on public.courses (category);
create index if not exists courses_level_idx on public.courses (level);

-- 2. Extend course_modules (acting as lessons / curriculum chapters)
alter table public.course_modules
  add column if not exists lesson_type text not null default 'video',
  add column if not exists video_url text,
  add column if not exists duration_minutes integer not null default 15,
  add column if not exists is_free_preview boolean not null default false,
  add column if not exists resources jsonb not null default '[]'::jsonb;

create index if not exists course_modules_free_preview_idx on public.course_modules (is_free_preview);
