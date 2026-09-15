"use server";

import { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request);

  const protectedPrefixes = ["/dashboard", "/admin", "/settings"];
  const isProtected = protectedPrefixes.some((p) =>
    request.nextUrl.pathname.startsWith(p)
  );

  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", request.nextUrl.pathname);
    return Response.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/cron|api/paystack/webhook|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};