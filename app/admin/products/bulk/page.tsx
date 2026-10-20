import { BulkUploader } from "@/components/admin/bulk-uploader";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Bulk Material Uploader | Admin",
  description: "Upload multiple books, keynote slides, and lecture materials simultaneously.",
};

export default function BulkUploadPage() {
  return (
    <div className="py-2">
      <BulkUploader />
    </div>
  );
}
