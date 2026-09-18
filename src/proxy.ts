import { NextRequest, NextResponse } from "next/server";
import { updateSupabaseSession } from "@/lib/supabase/middleware";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Selalu refresh sesi Supabase Auth dulu agar token tetap valid di seluruh situs.
  const { supabaseResponse, user } = await updateSupabaseSession(req);

  const isPesertaArea = pathname.startsWith("/dashboard");
  const isAdminArea = pathname.startsWith("/admin");

  if (!isPesertaArea && !isAdminArea) return supabaseResponse;

  if (!user) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const role = (user.user_metadata?.role as string) || "PESERTA";

  if (isAdminArea && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (isPesertaArea && role !== "PESERTA") {
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
