import { createAdminClient } from "@/lib/supabase/admin";
import { assertSuperAdmin } from "@/lib/auth-guard";
import { SpeakingInquiriesManager, type SpeakingInquiry } from "@/components/admin/inquiries-manager";

export const dynamic = "force-dynamic";

export default async function AdminSpeakingInquiriesPage() {
  await assertSuperAdmin();

  const admin = createAdminClient();
  const { data: inquiries } = await admin
    .from("speaking_inquiries")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-sans text-2xl sm:text-3xl font-bold text-slate-900">
          Keynote &amp; Speaking Inquiries
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-500">
          Review executive invitations, corporate training requests, and speaking honorariums. Connect with organizers directly via WhatsApp.
        </p>
      </div>

      <SpeakingInquiriesManager
        initialInquiries={(inquiries ?? []) as unknown as SpeakingInquiry[]}
      />
    </div>
  );
}
