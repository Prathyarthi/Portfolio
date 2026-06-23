"use client";

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
  BarChart3,
  CreditCard,
  LogOut,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/theme-toggle";
import { siteConfig } from "@/lib/site";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const NAV = [
  { title: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { title: "Edit", href: "/dashboard/edit", icon: Pencil },
  { title: "Templates", href: "/dashboard/templates", icon: Palette },
  { title: "Import", href: "/dashboard/import", icon: Download },
  { title: "Preview", href: "/dashboard/preview", icon: Eye },
  { title: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { title: "Billing", href: "/dashboard/billing", icon: CreditCard },
  { title: "Settings", href: "/dashboard/settings", icon: Settings },
];

function AppSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="h-16 justify-center border-b border-sidebar-border">
        <Link
          href="/dashboard"
          className="flex h-8 items-center gap-2 overflow-hidden px-2"
          aria-label={`${siteConfig.name} home`}
        >
          <span className="font-display text-lg font-bold text-brand-primary">
            <span className="group-data-[collapsible=icon]:hidden">{siteConfig.name}</span>
            <span className="hidden group-data-[collapsible=icon]:inline">L</span>
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV.map(({ title, href, icon: Icon }) => {
                const active =
                  href === "/dashboard"
                    ? pathname === href
                    : pathname.startsWith(href);
                return (
                  <SidebarMenuItem key={href}>
                    <SidebarMenuButton asChild isActive={active} tooltip={title}>
                      <Link href={href}>
                        <Icon aria-hidden />
                        <span>{title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <div className="flex items-center gap-2 rounded-md p-2 group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:gap-1">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarImage src={user?.avatar} alt="" />
            <AvatarFallback className="bg-brand-light text-brand-dark">
              {user?.name?.charAt(0)?.toUpperCase() ?? (
                <User className="h-4 w-4" aria-hidden />
              )}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
            <p className="truncate text-sm font-medium text-text-primary">
              {user?.name ?? "Your account"}
            </p>
            <p className="truncate text-xs text-text-muted">{user?.email}</p>
          </div>
          <div className="flex shrink-0 items-center gap-0.5 group-data-[collapsible=icon]:flex-col">
            <ThemeToggle className="size-8" />
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
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "15rem",
        } as React.CSSProperties
      }
    >
      <AppSidebar />
      <SidebarInset className="min-w-0 overflow-x-hidden bg-surface-base">
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-border-default bg-surface-base px-4">
          <SidebarTrigger className="size-9" />
          <Link href="/dashboard" className="font-display text-lg font-bold text-brand-primary md:hidden">
            {siteConfig.name}
          </Link>
          <div className="ml-auto flex items-center gap-1 md:hidden">
            <ThemeToggle className="size-9" />
          </div>
        </header>
        <main className="min-w-0 flex-1 overflow-x-hidden p-[var(--space-5)]">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
