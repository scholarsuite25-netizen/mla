import { createAdminClient } from "@/lib/supabase/admin";
import { NoticesManager, type NoticeItem } from "@/components/admin/notices-manager";

export const dynamic = "force-dynamic";
export const metadata = { title: "Notice Board & Announcements — MLA Admin" };

export default async function AdminNoticesPage() {
  const admin = createAdminClient();
  const { data: notices, error } = await admin
    .from("notices")
    .select("id, title, slug, content, category, is_pinned, is_published, published_at, created_at")
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    return <p className="text-crest-red p-6">{error.message}</p>;
  }

  return <NoticesManager initialNotices={(notices as NoticeItem[]) || []} />;
}
