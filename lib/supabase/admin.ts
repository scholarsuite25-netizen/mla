import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// WARNING: the service role key bypasses Row Level Security.
// This client MUST only ever be used in Server Components, Route Handlers
// or Server Actions. Never import this module from a "use client" file,
// and never expose it to a browser bundle.
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set."
    );
  }

  return createSupabaseClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}