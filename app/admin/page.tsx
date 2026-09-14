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
        ready={false}
      />
      <AdminCard
        title="Shop"
        description="Digital products and orders."
        href="/admin/shop"
        ready={false}
      />
      <AdminCard
        title="Members"
        description="Promote admins, suspend users."
        href="/admin/members"
        ready={false}
      />
      <AdminCard
        title="Institution Admin Requests"
        description="Approve or reject self-requests."
        href="/admin/requests"
        ready={false}
      />
      <AdminCard
        title="Audit Log"
        description="Who did what, when."
        href="/admin/audit"
        ready={false}
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
      <div className="rounded-md border border-parchment/10 bg-panel/50 p-6 opacity-60">
        <p className="font-display text-xl text-parchment">{title}</p>
        <p className="mt-1 text-sm text-parchment/60">{description}</p>
        <p className="mt-3 text-xs uppercase tracking-widest text-gold">
          Later phase
        </p>
      </div>
    );
  }
  return (
    <Link
      href={href}
      className="group rounded-md border border-parchment/10 bg-panel p-6 transition-colors hover:border-gold/60"
    >
      <p className="font-display text-xl text-parchment group-hover:text-gold">
        {title}
      </p>
      <p className="mt-1 text-sm text-parchment/60">{description}</p>
    </Link>
  );
}