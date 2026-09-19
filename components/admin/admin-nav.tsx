"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
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
    label: "Blog (CMS)",
    href: "/admin/blog",
    icon: FileText,
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
      <div className="flex items-center justify-between border-b border-white/10 bg-[#120D09] p-4 lg:hidden">
        <div className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 rotate-45 bg-gold" />
          <span className="font-display font-bold text-sm text-parchment">MLA Admin Suite</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="rounded-md border border-white/10 p-1.5 text-parchment/80 hover:text-gold"
          aria-label="Toggle admin navigation"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Navigation Sidebar (Desktop & Mobile Drawer) */}
      <aside
        className={`${
          mobileOpen ? "block" : "hidden"
        } lg:block shrink-0 w-full lg:w-64 border-b lg:border-b-0 lg:border-r border-white/10 bg-[#120D09]/95 backdrop-blur-xl p-5`}
      >
        <div className="hidden lg:flex items-center gap-2.5 pb-6 border-b border-white/10 mb-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold/15 border border-gold/30 text-gold">
            <span className="font-display font-bold text-sm">M</span>
          </div>
          <div>
            <h2 className="font-display font-bold text-sm text-parchment leading-tight">MLA Admin</h2>
            <p className="text-[10px] uppercase tracking-wider text-gold font-semibold">Super Admin Suite</p>
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
                    ? "bg-gradient-to-r from-gold/20 to-gold/5 border border-gold/40 text-gold font-semibold shadow-sm"
                    : "text-parchment/70 hover:text-parchment hover:bg-white/5 border border-transparent"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={16} className={isActive ? "text-gold" : "text-parchment/50"} />
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight size={13} className="text-gold" />}
              </Link>
            );
          })}
        </nav>

        <div className="mt-8 pt-6 border-t border-white/10 space-y-2">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between rounded-xl border border-white/5 px-3 py-2 text-xs text-parchment/60 hover:text-gold hover:border-gold/30 hover:bg-white/5 transition-all"
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
