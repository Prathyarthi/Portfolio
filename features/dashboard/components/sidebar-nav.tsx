"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Pencil,
  Palette,
  Download,
  Eye,
  Settings,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";

const navItems = [
  { title: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { title: "Edit Portfolio", href: "/dashboard/edit", icon: Pencil },
  { title: "Templates", href: "/dashboard/templates", icon: Palette },
  { title: "Import Data", href: "/dashboard/import", icon: Download },
  { title: "Preview", href: "/dashboard/preview", icon: Eye },
  { title: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <Sidebar className="border-r border-white/6 bg-[#090b12]/92 backdrop-blur-xl">
      <SidebarHeader className="border-b border-white/6 px-6 py-5">
        <Link href="/" className="flex items-center gap-2">
          <div>
            <span className="gradient-text text-xl font-bold tracking-wide">
              Foliofy
            </span>
            <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.24em] text-zinc-500">
              Portfolio OS
            </p>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="font-mono text-[11px] uppercase tracking-[0.22em] text-zinc-500">
            Portfolio
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    className="rounded-xl data-[active=true]:bg-white/8 data-[active=true]:text-zinc-100"
                  >
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
