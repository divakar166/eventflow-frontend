import { NextRequest, NextResponse } from "next/server";

const BASE_DOMAIN = process.env.NEXT_PUBLIC_BASE_DOMAIN || "localhost";

export function middleware(request: NextRequest) {
  const hostname = request.headers.get("host") || "";
  const host = hostname.split(":")[0];

  const subdomain = host.endsWith(`.${BASE_DOMAIN}`)
    ? host.slice(0, -BASE_DOMAIN.length - 1)
    : null;

  const response = NextResponse.next();

  if (subdomain) {
    response.headers.set("x-tenant-slug", subdomain);
    response.headers.set("x-is-tenant", "true");
  } else {
    response.headers.set("x-is-tenant", "false");
  }

  response.headers.set("x-hostname", host);
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
