"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Pencil,
  Palette,
  Download,
  Eye,
  Settings,
  CreditCard,
  LogOut,
  User,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

const NAV = [
  { title: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { title: "Edit", href: "/dashboard/edit", icon: Pencil },
  { title: "Templates", href: "/dashboard/templates", icon: Palette },
  { title: "Import", href: "/dashboard/import", icon: Download },
  { title: "Preview", href: "/dashboard/preview", icon: Eye },
  { title: "Billing", href: "/dashboard/billing", icon: CreditCard },
  { title: "Settings", href: "/dashboard/settings", icon: Settings },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center px-6">
        <Link href="/dashboard" className="flex items-center gap-2" onClick={onNavigate}>
          <span
            className="font-display text-[20px] font-bold tracking-[-0.01em] text-brand-primary"
          >
            Foliofy
          </span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-2" aria-label="Dashboard navigation">
        {NAV.map(({ title, href, icon: Icon }) => {
          const active =
            href === "/dashboard"
              ? pathname === href
              : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-[14px] font-medium transition-colors duration-150",
                active
                  ? "bg-brand-light text-brand-primary"
                  : "text-text-secondary hover:bg-surface-sunken hover:text-text-primary"
              )}
            >
              <Icon className="h-5 w-5 shrink-0" aria-hidden />
              {title}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border-default p-3">
        <div className="flex items-center gap-3 rounded-[var(--radius-md)] px-2 py-2">
          <Avatar className="h-9 w-9">
            <AvatarImage src={user?.avatar} alt="" />
            <AvatarFallback className="bg-brand-light text-brand-dark">
              {user?.name?.charAt(0)?.toUpperCase() ?? <User className="h-4 w-4" />}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[14px] font-medium text-text-primary">
              {user?.name ?? "Your account"}
            </p>
            <p className="truncate text-body-sm text-text-muted">{user?.email}</p>
          </div>
          <ThemeToggle className="size-9" />
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Sign out"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            <LogOut className="h-4 w-4" aria-hidden />
          </Button>
        </div>
      </div>
    </div>
  );
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface-base">
      {/* Fixed sidebar (desktop) */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 border-r border-border-default bg-surface-raised md:block">
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true">
          <div
            className="absolute inset-0 bg-text-primary/30"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className="absolute inset-y-0 left-0 w-64 border-r border-border-default bg-surface-raised shadow-[var(--shadow-modal)]">
            <SidebarContent onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}

      <div className="md:pl-60">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border-default bg-surface-base px-4 md:hidden">
          <Button
            variant="ghost"
            size="icon"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen(true)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <Link href="/dashboard">
            <span
              className="font-display text-[18px] font-bold text-brand-primary"
            >
              Foliofy
            </span>
          </Link>
          <ThemeToggle />
        </header>

        <main className="p-[var(--space-5)]">{children}</main>
      </div>
    </div>
  );
}
