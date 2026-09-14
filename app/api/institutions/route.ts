import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const q = (url.searchParams.get("q") ?? "").trim();
  if (!q) return NextResponse.json({ institutions: [] });

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("institutions")
    .select("name")
    .ilike("name", `%${q}%`)
    .order("name")
    .limit(8);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ institutions: data?.map((i) => i.name) ?? [] });
}