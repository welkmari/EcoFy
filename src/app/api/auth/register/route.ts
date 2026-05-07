import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getCompactUserMetadata } from "@/lib/userPreferences";

const registerSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(6),
    confirmPassword: z.string().min(6),
  })
  .refine((data) => data.password === data.confirmPassword);

export async function POST(request: Request) {
  const requestUrl = new URL(request.url);
  const formData = await request.formData();
  const parsed = registerSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return redirectToRegister(requestUrl, "invalid");
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${requestUrl.origin}/auth/callback?next=/overview`,
    },
  });

  if (error) {
    return redirectToRegister(requestUrl, "failed");
  }

  if (data.session && data.user) {
    await supabase.auth.updateUser({
      data: getCompactUserMetadata(data.user.user_metadata, data.user.email),
    });
    await supabase.auth.refreshSession();

    return NextResponse.redirect(new URL("/overview", requestUrl.origin), {
      status: 303,
    });
  }

  return NextResponse.redirect(
    new URL("/register?sent=1", requestUrl.origin),
    { status: 303 },
  );
}

function redirectToRegister(requestUrl: URL, error: string) {
  const registerUrl = new URL("/register", requestUrl.origin);
  registerUrl.searchParams.set("error", error);
  return NextResponse.redirect(registerUrl, { status: 303 });
}
