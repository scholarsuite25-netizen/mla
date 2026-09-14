import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const schema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid email." },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("subscribers")
    .insert({ email: parsed.data.email });
  if (error && error.code !== "23505") {
    console.error("Newsletter signup failed:", error);
    return NextResponse.json({ error: "Could not subscribe." }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    message:
      error?.code === "23505" ? "You're already subscribed." : "You're on the list.",
  });
}