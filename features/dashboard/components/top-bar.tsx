"use client";

import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { LogOut, User } from "lucide-react";

export function TopBar() {
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <header className="flex h-16 items-center gap-4 border-b border-white/6 bg-[#080b14]/70 px-4 backdrop-blur-xl">
      <SidebarTrigger />
      <div className="flex-1">
        <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-zinc-500">
          Workspace
        </p>
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
    </header>
  );
}
