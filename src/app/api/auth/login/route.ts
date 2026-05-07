import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getCompactUserMetadata } from "@/lib/userPreferences";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(request: Request) {
  const requestUrl = new URL(request.url);
  const formData = await request.formData();
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return redirectToLogin(requestUrl, request, "invalid");
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error || !data.user) {
    return redirectToLogin(requestUrl, request, "invalid");
  }

  await supabase.auth.updateUser({
    data: getCompactUserMetadata(data.user.user_metadata, data.user.email),
  });
  await supabase.auth.refreshSession();

  return NextResponse.redirect(
    new URL(getSafeNextPath(request) ?? "/overview", requestUrl.origin),
    { status: 303 },
  );
}

function redirectToLogin(requestUrl: URL, request: Request, error: string) {
  const loginUrl = new URL("/login", requestUrl.origin);
  loginUrl.searchParams.set("error", error);

  const next = getSafeNextPath(request);
  if (next) loginUrl.searchParams.set("next", next);

  return NextResponse.redirect(loginUrl, { status: 303 });
}

function getSafeNextPath(request: Request) {
  const referer = request.headers.get("referer");
  if (!referer) return null;

  try {
    const next = new URL(referer).searchParams.get("next");
    return next?.startsWith("/") ? next : null;
  } catch {
    return null;
  }
}
