"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MessageSquare,
  LayoutDashboard,
  FileText,
  BookOpen,
  ShoppingBag,
  KeyRound,
  Users,
  UserCheck,
  ShieldCheck,
  ExternalLink,
  ChevronRight,
  Menu,
  X,
  Send,
  CreditCard,
  QrCode,
  Mic,
  UploadCloud,
  Bell,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  {
    label: "Overview",
    href: "/admin",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    label: "Notices & Bulletins",
    href: "/admin/notices",
    icon: Bell,
  },
  {
    label: "Blog (CMS)",
    href: "/admin/blog",
    icon: FileText,
  },
  {
    label: "Comments",
    href: "/admin/blog/comments",
    icon: MessageSquare,
  },
  {
    label: "Courses (LMS)",
    href: "/admin/courses",
    icon: BookOpen,
  },
  {
    label: "Shop & Products",
    href: "/admin/products",
    icon: ShoppingBag,
  },
  {
    label: "Bulk Uploader",
    href: "/admin/products/bulk",
    icon: UploadCloud,
  },
  {
    label: "Orders & Transfers",
    href: "/admin/orders",
    icon: CreditCard,
  },
  {
    label: "Stage QR Slides",
    href: "/admin/events-qr",
    icon: QrCode,
  },
  {
    label: "Speaking Inquiries",
    href: "/admin/inquiries",
    icon: Mic,
  },
  {
    label: "Licences (DRM)",
    href: "/admin/licenses",
    icon: KeyRound,
  },
  {
    label: "Members (CRM)",
    href: "/admin/members",
    icon: Users,
  },
  {
    label: "Broadcast & Emails",
    href: "/admin/emails",
    icon: Send,
  },
  {
    label: "Requests",
    href: "/admin/requests",
    icon: UserCheck,
  },
  {
    label: "Audit Log",
    href: "/admin/audit",
    icon: ShieldCheck,
  },
];

export function AdminNav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile Bar */}
      <div className="flex items-center justify-between border-b border-white/10 bg-[#120D42] p-4 lg:hidden">
        <div className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-[#00D2FF] shadow-[0_0_8px_#00D2FF]" />
          <span className="font-display font-bold text-sm text-white">MLA Admin Suite</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="rounded-lg border border-white/15 p-1.5 text-slate-300 hover:text-white hover:bg-white/5 transition"
          aria-label="Toggle admin navigation"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Navigation Sidebar (Desktop & Mobile Drawer) */}
      <aside
        className={`${
          mobileOpen ? "block" : "hidden"
        } lg:block shrink-0 w-full lg:w-64 border-b lg:border-b-0 lg:border-r border-white/10 bg-[#120D42] backdrop-blur-xl p-5 shadow-xl`}
      >
        <div className="hidden lg:flex items-center gap-2.5 pb-6 border-b border-white/10 mb-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/15 border border-cyan-400/30 text-[#00D2FF] font-bold">
            <span className="font-display text-base">M</span>
          </div>
          <div>
            <h2 className="font-display font-bold text-sm text-white leading-tight">MLA Admin</h2>
            <p className="text-[10px] uppercase tracking-wider text-[#00D2FF] font-semibold">Super Admin Suite</p>
          </div>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-medium transition-all ${
                  isActive
                    ? "bg-white/10 border border-cyan-400/40 text-[#00D2FF] font-semibold shadow-sm"
                    : "text-slate-300 hover:text-white hover:bg-white/5 border border-transparent"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={16} className={isActive ? "text-[#00D2FF]" : "text-slate-400"} />
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight size={13} className="text-[#00D2FF]" />}
              </Link>
            );
          })}
        </nav>

        <div className="mt-8 pt-6 border-t border-white/10 space-y-2">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between rounded-xl border border-white/10 px-3 py-2 text-xs text-slate-300 hover:text-[#00D2FF] hover:border-cyan-400/40 hover:bg-white/5 transition-all"
          >
            <span className="flex items-center gap-2">
              <ExternalLink size={14} />
              <span>View Public Website</span>
            </span>
          </Link>
        </div>
      </aside>
    </>
  );
}
