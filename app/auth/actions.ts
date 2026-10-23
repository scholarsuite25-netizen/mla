"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const email = z.string().trim().toLowerCase().email("Enter a valid email.");
const password = z
  .string()
  .min(8, "Password must be at least 8 characters.");
const fullName = z.string().trim().min(1, "Full name is required.");

export type ActionResult = { error?: string };

export async function signInAction(formData: FormData): Promise<ActionResult> {
  const parsed = z.object({ email, password }).safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const supabase = await createClient();
  const { data: authData, error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { error: "Invalid email or password. Please check your credentials." };

  const nextRaw = formData.get("next");
  if (typeof nextRaw === "string" && nextRaw.startsWith("/") && !nextRaw.startsWith("//")) {
    redirect(nextRaw);
  }

  if (authData?.user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, pathway")
      .eq("id", authData.user.id)
      .single();

    if (profile?.role === "super_admin") {
      redirect("/admin");
    }

    // Guide new members who haven't completed their learning track to onboarding
    if (!profile?.pathway) {
      redirect("/dashboard/onboarding");
    }
  }

  redirect("/dashboard");
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function signUpAction(formData: FormData): Promise<ActionResult> {
  const parsed = z
    .object({
      email,
      password,
      fullName,
    })
    .safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
      fullName: formData.get("full_name"),
    });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        full_name: parsed.data.fullName,
        email_notifications_enabled: true,
      },
    },
  });
  if (error) return { error: error.message };

  revalidatePath("/");
  redirect("/login?registered=1");
}

export async function forgotPasswordAction(formData: FormData): Promise<ActionResult> {
  const parsed = z.object({ email }).safeParse({ email: formData.get("email") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const supabase = await createClient();
  const origin = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${origin}/auth/callback?next=/reset-password`,
  });

  if (error) return { error: error.message };

  return {};
}

export async function resetPasswordAction(formData: FormData): Promise<ActionResult> {
  const parsed = z.object({ password }).safeParse({ password: formData.get("password") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) return { error: error.message };

  redirect("/dashboard");
}