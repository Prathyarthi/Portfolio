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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Pencil,
  Palette,
  Download,
  Eye,
  Settings,
  LogOut,
  User,
  CreditCard,
  ChevronDown,
  Menu,
} from "lucide-react";

const primaryNav = [
  { title: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { title: "Edit", href: "/dashboard/edit", icon: Pencil },
  { title: "Preview", href: "/dashboard/preview", icon: Eye },
] as const;

const moreNav = [
  { title: "Templates", href: "/dashboard/templates", icon: Palette },
  { title: "Import", href: "/dashboard/import", icon: Download },
  { title: "Pricing", href: "/pricing", icon: CreditCard },
  { title: "Settings", href: "/dashboard/settings", icon: Settings },
] as const;

const allNav = [...primaryNav, ...moreNav];

function NavLink({
  href,
  title,
  Icon,
  active,
}: {
  href: string;
  title: string;
  Icon: (typeof primaryNav)[number]["icon"];
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm transition-colors",
        active
          ? "bg-white/10 text-zinc-50"
          : "text-zinc-400 hover:bg-white/5 hover:text-zinc-100"
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {title}
    </Link>
  );
}

export function TopBar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const user = session?.user;

  return (
    <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-[#080b14]/80 backdrop-blur-xl">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
        <Link href="/dashboard" className="flex shrink-0 items-center gap-2.5 sm:gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-sm font-semibold text-white">
            F
          </div>
          <div className="hidden leading-tight sm:block">
            <p className="text-sm font-semibold text-zinc-50">Foliofy</p>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-600">
              Workspace
            </p>
          </div>
        </Link>

        <nav className="hidden min-w-0 flex-1 items-center justify-center gap-0.5 lg:flex">
          {primaryNav.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              title={item.title}
              Icon={item.icon}
              active={pathname === item.href}
            />
          ))}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-3 py-2 text-sm transition-colors",
                  moreNav.some((m) => m.href === pathname)
                    ? "bg-white/10 text-zinc-50"
                    : "text-zinc-400 hover:bg-white/5 hover:text-zinc-100"
                )}
              >
                More
                <ChevronDown className="h-3.5 w-3.5 opacity-70" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="center"
              className="min-w-[11rem] border-white/8 bg-[#0e1018]/95 text-zinc-100 backdrop-blur-xl"
            >
              <DropdownMenuLabel className="text-xs font-normal text-zinc-500">
                Workspace
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/8" />
              {moreNav.map((item) => {
                const Icon = item.icon;
                return (
                  <DropdownMenuItem key={item.href} asChild className="focus:bg-white/8">
                    <Link href={item.href} className="flex cursor-pointer items-center gap-2">
                      <Icon className="h-4 w-4" />
                      {item.title}
                    </Link>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 rounded-xl border-white/10 bg-white/[0.03] lg:hidden"
                aria-label="Open menu"
              >
                <Menu className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-52 border-white/8 bg-[#0e1018]/95 text-zinc-100 backdrop-blur-xl"
            >
              {allNav.map((item) => {
                const Icon = item.icon;
                return (
                  <DropdownMenuItem key={item.href} asChild className="focus:bg-white/8">
                    <Link href={item.href} className="flex cursor-pointer items-center gap-2">
                      <Icon className="h-4 w-4" />
                      {item.title}
                    </Link>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="hidden text-right md:block">
            <p className="text-sm font-medium text-zinc-100">{user?.name}</p>
            <p className="max-w-[10rem] truncate text-xs text-zinc-500">{user?.email}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-10 w-10 shrink-0 rounded-full border border-white/8 bg-white/4"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatar} alt={user?.name ?? ""} />
                  <AvatarFallback>
                    {user?.name?.charAt(0)?.toUpperCase() ?? <User className="h-4 w-4" />}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="border-white/8 bg-[#0e1018]/95 text-zinc-100 backdrop-blur-xl"
            >
              <div className="flex items-center gap-2 p-2">
                <div className="flex min-w-0 flex-col space-y-1">
                  <p className="truncate text-sm font-medium text-zinc-100">{user?.name}</p>
                  <p className="truncate text-xs text-zinc-500">{user?.email}</p>
                </div>
              </div>
              <DropdownMenuSeparator className="bg-white/8" />
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
