"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Pencil, Palette, Download, Eye, Settings, LogOut, User } from "lucide-react";

const navItems = [
  { title: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { title: "Edit", href: "/dashboard/edit", icon: Pencil },
  { title: "Templates", href: "/dashboard/templates", icon: Palette },
  { title: "Import", href: "/dashboard/import", icon: Download },
  { title: "Preview", href: "/dashboard/preview", icon: Eye },
  { title: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function TopBar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const user = session?.user;

  return (
    <header className="sticky top-0 z-30 border-b border-white/6 bg-[#080b14]/80 backdrop-blur-xl">
      <div className="flex h-16 items-center gap-4 px-4 sm:px-6">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-sm font-bold text-white">
            F
          </div>
          <div className="leading-tight">
            <p className="text-sm font-semibold text-zinc-50">Foliofy</p>
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-zinc-500">
              Portfolio workspace
            </p>
          </div>
        </Link>

        <nav className="hidden flex-1 items-center justify-center gap-1 lg:flex">
          {navItems.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-white/10 text-zinc-50"
                    : "text-zinc-400 hover:bg-white/5 hover:text-zinc-100"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.title}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium text-zinc-100">{user?.name}</p>
            <p className="text-xs text-zinc-500">{user?.email}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-10 w-10 rounded-full border border-white/8 bg-white/4"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatar} alt={user?.name ?? ""} />
                  <AvatarFallback>
                    {user?.name?.charAt(0)?.toUpperCase() ?? (
                      <User className="h-4 w-4" />
                    )}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="border-white/8 bg-[#0e1018]/95 text-zinc-100 backdrop-blur-xl"
            >
              <div className="flex items-center gap-2 p-2">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium text-zinc-100">{user?.name}</p>
                  <p className="text-xs text-zinc-500">{user?.email}</p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
