import { EmailComposer } from "@/components/admin/email-composer";

export const dynamic = "force-dynamic";

export default function EmailsDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-parchment">Broadcasts & Emails</h1>
        <p className="mt-1 text-sm text-parchment/60">
          Send announcements, newsletters, or 1-on-1 messages to academy members.
        </p>
      </div>

      <EmailComposer />
    </div>
  );
}
