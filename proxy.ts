import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  APP_ROUTE_PREFIXES,
  extractPortfolioSubdomain,
  getAppOrigin,
  getInternalPortfolioPath,
  getPortfolioRootDomain,
} from "@/lib/domain";

function redirectToPortfolioSubdomain(request: NextRequest, slug: string) {
  const rootDomain = getPortfolioRootDomain();
  const { protocol, port, search } = request.nextUrl;
  const host = port ? `${slug}.${rootDomain}:${port}` : `${slug}.${rootDomain}`;
  const destination = new URL(`${protocol}//${host}/`);
  destination.search = search;
  return NextResponse.redirect(destination);
}

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  const subdomain = extractPortfolioSubdomain(host);
  const { pathname, search } = request.nextUrl;

  const legacyPathMatch = pathname.match(/^\/(?:p|sites)\/([a-z0-9-]+)\/?$/);

  if (!subdomain && legacyPathMatch) {
    return redirectToPortfolioSubdomain(request, legacyPathMatch[1]);
  }

  if (!subdomain) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/p/") || pathname.startsWith("/sites/")) {
    const destination = request.nextUrl.clone();
    destination.pathname = "/";
    return NextResponse.redirect(destination);
  }

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
    url.pathname = getInternalPortfolioPath(subdomain);
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
