"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  X,
  LayoutDashboard,
  KeyRound,
  Settings,
  ShieldCheck,
  BookOpen,
  GraduationCap,
  Users,
  Compass,
  Award,
  Sparkles,
  Calendar,
  ShoppingBag,
  Building2,
  FileText,
} from "lucide-react";
import { signOutAction } from "@/app/auth/actions";

export type NavLink = {
  label: string;
  href: string;
  children?: {
    label: string;
    href: string;
    description?: string;
  }[];
};

const iconMap: Record<string, React.ReactNode> = {
  "Our Mission": <BookOpen size={16} className="text-gold" />,
  "Institutions": <Building2 size={16} className="text-gold" />,
  "Course Catalog": <GraduationCap size={16} className="text-gold" />,
  "My Learning": <Compass size={16} className="text-gold" />,
  "Find a Mentor": <Users size={16} className="text-gold" />,
  "Become a Mentor": <Award size={16} className="text-gold" />,
  "My Requests": <FileText size={16} className="text-gold" />,
  "Blog": <Sparkles size={16} className="text-gold" />,
  "Events": <Calendar size={16} className="text-gold" />,
  "Shop": <ShoppingBag size={16} className="text-gold" />,
};

function Dropdown({ link }: { link: NavLink }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isActive = pathname === link.href || link.children?.some(c => pathname.startsWith(c.href));

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <Link
        href={link.href}
        className={`inline-flex items-center gap-1.5 rounded-md px-3.5 py-2 text-sm font-medium transition-all ${
          isActive
            ? "text-gold font-semibold"
            : "text-parchment/80 hover:text-gold hover:bg-white/[0.03]"
        }`}
      >
        {link.label}
        <ChevronDown
          size={14}
          className={`transition-transform duration-200 ${open ? "rotate-180 text-gold" : "text-parchment/50"}`}
        />
      </Link>
      {open && (
        <div className="absolute left-0 top-full pt-1 w-64 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="rounded-xl border border-gold/20 bg-[#16120E]/95 p-2 backdrop-blur-2xl shadow-[0_12px_40px_rgba(0,0,0,0.7)]">
            {link.children?.map((child) => (
              <Link
                key={child.href}
                href={child.href}
                className="group flex items-start gap-3 rounded-lg p-2.5 transition-colors hover:bg-gold/10"
              >
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-white/5 bg-white/[0.03] group-hover:border-gold/30">
                  {iconMap[child.label] ?? <Sparkles size={14} className="text-gold" />}
                </div>
                <div>
                  <p className="text-sm font-medium text-parchment group-hover:text-gold">
                    {child.label}
                  </p>
                  {child.description && (
                    <p className="text-xs text-parchment/50 group-hover:text-parchment/70">
                      {child.description}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export type NavUser = {
  full_name: string;
  role: string;
};

export function NavClient({
  links,
  user,
  unread,
}: {
  links: NavLink[];
  user: NavUser | null;
  unread: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);

  const isAdmin = user?.role === "super_admin";

  return (
    <>
      {/* Desktop Links */}
      <nav className="hidden items-center gap-1 lg:flex">
        {links.map((link) =>
          link.children ? (
            <Dropdown key={link.href} link={link} />
          ) : (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-md px-3.5 py-2 text-sm font-medium transition-all ${
                pathname === link.href
                  ? "text-gold font-semibold"
                  : "text-parchment/80 hover:text-gold hover:bg-white/[0.03]"
              }`}
            >
              {link.label}
            </Link>
          )
        )}
      </nav>

      {/* Action / User Bar */}
      <div className="flex items-center gap-3">
        {user ? (
          <>
            {/* Notification Bell */}
            <Link
              href="/dashboard/notifications"
              className="relative rounded-lg border border-white/5 p-2 text-parchment/75 transition-colors hover:border-gold/30 hover:bg-gold/5 hover:text-gold"
              aria-label="Notifications"
            >
              <Bell size={18} />
              {unread > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-crest-red px-1 text-[9px] font-bold text-white shadow-[0_0_8px_rgba(220,38,38,0.7)] animate-pulse">
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </Link>

            {/* Admin Quick Button */}
            {isAdmin && (
              <Link
                href="/admin"
                className="hidden items-center gap-1.5 rounded-lg border border-gold/40 bg-gold/10 px-3 py-1.5 text-xs font-semibold tracking-wide text-gold transition-all hover:bg-gold hover:text-ink sm:inline-flex shadow-sm"
              >
                <ShieldCheck size={14} />
                Admin
              </Link>
            )}

            {/* User Avatar Menu */}
            <div className="relative">
              <button
                onClick={() => setAvatarOpen((v) => !v)}
                className="flex items-center gap-2 rounded-full border border-white/10 bg-[#1A1410] p-1 pr-2.5 transition-all hover:border-gold/40 hover:bg-[#241B15]"
                aria-label="Account menu"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-tr from-crest-red to-red-500 font-display text-xs font-bold text-white shadow-sm">
                  {user.full_name?.charAt(0)?.toUpperCase() || "U"}
                </div>
                <span className="hidden text-xs font-medium text-parchment/90 md:block max-w-[100px] truncate">
                  {user.full_name?.split(" ")[0] || "Account"}
                </span>
                <ChevronDown size={12} className="text-parchment/50" />
              </button>

              {avatarOpen && (
                <div
                  className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-gold/20 bg-[#16120E]/95 p-1.5 backdrop-blur-2xl shadow-[0_12px_40px_rgba(0,0,0,0.8)] z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                  onMouseLeave={() => setAvatarOpen(false)}
                >
                  <div className="border-b border-white/[0.08] px-3 py-2.5">
                    <p className="text-xs font-semibold text-parchment truncate">{user.full_name || "Member"}</p>
                    <p className="mt-0.5 text-[10px] uppercase tracking-wider font-semibold text-gold">
                      {user.role === "super_admin" ? "Super Admin" : user.role === "institution_admin" ? "Institution Admin" : "Member"}
                    </p>
                  </div>
                  <div className="py-1 space-y-0.5">
                    <AvatarLink href="/dashboard" icon={<LayoutDashboard size={14} />} label="My Dashboard" onClose={() => setAvatarOpen(false)} />
                    <AvatarLink href="/dashboard/licenses" icon={<KeyRound size={14} />} label="My Licenses" onClose={() => setAvatarOpen(false)} />
                    <AvatarLink href="/settings" icon={<Settings size={14} />} label="Settings" onClose={() => setAvatarOpen(false)} />
                  </div>
                  <div className="border-t border-white/[0.08] pt-1 mt-1">
                    <button
                      onClick={async () => {
                        await signOutAction();
                        router.push("/");
                        router.refresh();
                      }}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-medium text-parchment/70 transition-colors hover:bg-crest-red/15 hover:text-red-400"
                    >
                      <LogOut size={14} /> Log Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="rounded-lg px-3.5 py-2 text-sm font-medium text-parchment/80 transition-colors hover:text-gold"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="btn-primary !px-4 !py-2 !text-xs !font-semibold"
            >
              Join MLA
            </Link>
          </div>
        )}

        {/* Mobile Hamburger */}
        <button
          className="rounded-lg border border-white/5 p-2 text-parchment hover:border-gold/30 hover:text-gold lg:hidden"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="absolute left-0 right-0 top-18 border-b border-white/[0.08] bg-[#0E0B08]/98 backdrop-blur-2xl lg:hidden shadow-2xl animate-in slide-in-from-top-4 duration-200">
          <div className="mx-auto max-w-6xl space-y-2 px-6 py-6 max-h-[80vh] overflow-y-auto">
            {links.map((link) => (
              <div key={link.href} className="border-b border-white/[0.04] pb-2 last:border-0">
                <Link
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block py-1.5 text-sm font-semibold text-parchment hover:text-gold"
                >
                  {link.label}
                </Link>
                {link.children && (
                  <div className="mt-1 space-y-1 pl-3">
                    {link.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-2 py-1.5 text-xs text-parchment/65 hover:text-gold"
                      >
                        {iconMap[child.label]}
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {!user && (
              <div className="pt-4 flex flex-col gap-2">
                <Link
                  href="/register"
                  onClick={() => setMobileOpen(false)}
                  className="btn-primary w-full text-center"
                >
                  Create Free Account
                </Link>
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="btn-secondary w-full text-center"
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function AvatarLink({
  href,
  icon,
  label,
  onClose,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  onClose: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClose}
      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-parchment/80 transition-colors hover:bg-gold/10 hover:text-gold"
    >
      <span className="text-parchment/50">{icon}</span>
      {label}
    </Link>
  );
}