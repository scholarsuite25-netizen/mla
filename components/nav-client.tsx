"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, ChevronDown, LogOut, Menu, X } from "lucide-react";
import { signOutAction } from "@/app/auth/actions";

export type NavLink = {
  label: string;
  href: string;
  children?: NavLink[];
};

function Dropdown({ link }: { link: NavLink }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <Link
        href={link.href}
        className="inline-flex items-center gap-1 px-3 py-2 text-sm text-parchment/80 hover:text-gold"
      >
        {link.label}
        <ChevronDown size={14} />
      </Link>
      {open && (
        <div className="absolute left-0 top-full w-52 rounded-md border border-parchment/10 bg-panel shadow-xl">
          {link.children?.map((child) => (
            <Link
              key={child.href}
              href={child.href}
              className="block px-4 py-2 text-sm text-parchment/90 hover:bg-ink hover:text-gold"
            >
              {child.label}
            </Link>
          ))}
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
  const [mobileOpen, setMobileOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);

  const isAdmin = user?.role === "super_admin";

  return (
    <>
      <nav className="hidden items-center lg:flex">
        {links.map((link) =>
          link.children ? (
            <Dropdown key={link.href} link={link} />
          ) : (
            <Link
              key={link.href}
              href={link.href}
              className="px-3 py-2 text-sm text-parchment/80 hover:text-gold"
            >
              {link.label}
            </Link>
          )
        )}
      </nav>

      <div className="flex items-center gap-3">
        {user ? (
          <>
            <Link
              href="/dashboard/notifications"
              className="relative p-2 text-parchment/80 hover:text-gold"
              aria-label="Notifications"
            >
              <Bell size={20} />
              {unread > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-crest-red px-1 text-[10px] font-bold text-white">
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </Link>

            {isAdmin && (
              <Link
                href="/admin"
                className="hidden rounded-sm border border-gold/50 px-3 py-1.5 text-xs text-gold hover:bg-gold hover:text-ink sm:block"
              >
                Admin
              </Link>
            )}

            <div className="relative">
              <button
                onClick={() => setAvatarOpen((v) => !v)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-crest-red font-display text-sm text-white"
                aria-label="Account menu"
              >
                {user.full_name?.charAt(0)?.toUpperCase() || "U"}
              </button>
              {avatarOpen && (
                <div
                  className="absolute right-0 top-full mt-2 w-48 rounded-md border border-parchment/10 bg-panel py-1 shadow-xl"
                  onMouseLeave={() => setAvatarOpen(false)}
                >
                  <div className="border-b border-parchment/10 px-4 py-2 text-xs text-parchment/60">
                    {user.full_name || "Member"}
                  </div>
                  <AvatarLink href="/dashboard" label="My Dashboard" onClose={() => setAvatarOpen(false)} />
                  <AvatarLink href="/dashboard/licenses" label="My Licenses" onClose={() => setAvatarOpen(false)} />
                  <AvatarLink href="/settings" label="Settings" onClose={() => setAvatarOpen(false)} />
                  <button
                    onClick={async () => {
                      await signOutAction();
                      router.push("/");
                      router.refresh();
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-parchment/90 hover:bg-ink hover:text-crest-red"
                  >
                    <LogOut size={14} /> Log Out
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <Link
            href="/login"
            className="rounded-sm bg-crest-red px-4 py-2 text-sm font-medium text-white hover:bg-crest-red/90"
          >
            Login
          </Link>
        )}

        <button
          className="p-2 text-parchment lg:hidden"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="absolute left-0 right-0 top-16 border-b border-parchment/10 bg-panel lg:hidden">
          <div className="mx-auto max-w-6xl space-y-1 px-4 py-4">
            {links.map((link) => (
              <div key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block py-2 text-sm text-parchment/90 hover:text-gold"
                >
                  {link.label}
                </Link>
                {link.children?.map((child) => (
                  <Link
                    key={child.href}
                    href={child.href}
                    onClick={() => setMobileOpen(false)}
                    className="block py-1 pl-4 text-sm text-parchment/60 hover:text-gold"
                  >
                    {child.label}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

function AvatarLink({
  href,
  label,
  onClose,
}: {
  href: string;
  label: string;
  onClose: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClose}
      className="block px-4 py-2 text-sm text-parchment/90 hover:bg-ink hover:text-gold"
    >
      {label}
    </Link>
  );
}