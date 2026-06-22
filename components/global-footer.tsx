"use client";

import { usePathname } from "next/navigation";
import { Footer } from "@/features/landing/components/footer";

/** Hide marketing footer on published user portfolio pages. */
function shouldShowFooter(pathname: string): boolean {
  return !pathname.startsWith("/sites/");
}

export function GlobalFooter() {
  const pathname = usePathname();

  if (!shouldShowFooter(pathname)) {
    return null;
  }

  return <Footer />;
}
