import Link from "next/link";

export default function AdminIndexPage() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <AdminCard
        title="Blog"
        description="Write, edit, and publish posts."
        href="/admin/blog"
        ready
      />
      <AdminCard
        title="Courses"
        description="Manage courses and modules."
        href="/admin/courses"
        ready
      />
      <AdminCard
        title="Shop"
        description="Products, files, and orders."
        href="/admin/products"
        ready
      />
      <AdminCard
        title="Licences"
        description="Reset activations or revoke keys."
        href="/admin/licenses"
        ready
      />
      <AdminCard
        title="Institution Admin Requests"
        description="Approve or reject self-requests."
        href="/admin/requests"
        ready
      />
      <AdminCard
        title="Audit Log"
        description="Who did what, when."
        href="/admin/audit"
        ready
      />
      <AdminCard
        title="Members"
        description="Promote admins, suspend users."
        href="/admin/members"
        ready
      />
    </div>
  );
}

function AdminCard({
  title,
  description,
  href,
  ready,
}: {
  title: string;
  description: string;
  href: string;
  ready: boolean;
}) {
  if (!ready) {
    return (
      <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-6 opacity-60">
        <p className="font-display text-base sm:text-lg font-bold text-slate-400">{title}</p>
        <p className="mt-1 text-xs text-slate-400">{description}</p>
        <p className="mt-3 text-[10px] uppercase font-bold tracking-wider text-slate-400">
          Later phase
        </p>
      </div>
    );
  }
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm hover:border-cyan-400/80 hover:shadow-md transition-all"
    >
      <p className="font-display text-base sm:text-lg font-bold text-slate-900 group-hover:text-[#0284C7] transition-colors">
        {title}
      </p>
      <p className="mt-1.5 text-xs sm:text-sm text-slate-500 leading-relaxed">{description}</p>
    </Link>
  );
}