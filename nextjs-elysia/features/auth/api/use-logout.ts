"use client";

import { useMutation } from "@tanstack/react-query";
import { signOut } from "next-auth/react";

export function useLogout() {
  return useMutation({
    mutationFn: () => signOut({ callbackUrl: "/", redirect: true }),
  });
}
