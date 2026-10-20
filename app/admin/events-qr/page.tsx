import { assertSuperAdmin } from "@/lib/auth-guard";
import { getStoreSettings } from "@/lib/store";
import { EventQrPresenter } from "@/components/admin/event-qr-presenter";

export const dynamic = "force-dynamic";

export default async function AdminEventsQrPage() {
  await assertSuperAdmin();

  const storeSettings = await getStoreSettings();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mla.org.ng";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-parchment">
          Stage QR Code & Live Presentation Slide
        </h1>
        <p className="mt-1 text-xs text-parchment/60">
          Project this slide onto auditorium screens at speaking events. Attendees scan the QR code to instantly download your keynote notes, apply promo codes, and make direct GTBank transfers.
        </p>
      </div>

      <EventQrPresenter siteUrl={siteUrl} storeSettings={storeSettings} />
    </div>
  );
}
