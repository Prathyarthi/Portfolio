import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  APP_ROUTE_PREFIXES,
  extractPortfolioSubdomain,
  getAppOrigin,
} from "@/lib/domain";

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  const subdomain = extractPortfolioSubdomain(host);

  if (!subdomain) {
    return NextResponse.next();
  }

  const { pathname, search } = request.nextUrl;

  if (pathname.startsWith("/p/")) {
    return NextResponse.next();
  }

  // API routes are served on the same Next.js app — rewriting/redirecting them
  // to the apex host breaks client-side fetches (e.g. next-auth session checks).
  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  const isAppPage = APP_ROUTE_PREFIXES.some(
    (prefix) => prefix !== "/api" && pathname.startsWith(prefix),
  );

  if (isAppPage) {
    const apex = getAppOrigin();
    return NextResponse.redirect(new URL(`${pathname}${search}`, apex));
  }

  if (pathname === "/" || pathname === "") {
    const url = request.nextUrl.clone();
    url.pathname = `/p/${subdomain}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
