"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export type ActionResult = { error?: string };

const eventSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters."),
  description: z.string().trim().max(5000, "Description is too long."),
  start_time: z.string().min(1, "Start time is required."),
  end_time: z.string().optional().nullable(),
  location_or_link: z.string().trim().max(500, "Location is too long.").optional().nullable(),
  institution_id: z.string().uuid().nullable(),
});

function getEventInput(formData: FormData) {
  const title = String(formData.get("title") ?? "");
  const description = String(formData.get("description") ?? "");
  const start_time = String(formData.get("start_time") ?? "");
  const end_time_raw = String(formData.get("end_time") ?? "").trim();
  const end_time = end_time_raw.length > 0 ? end_time_raw : null;
  const loc_raw = String(formData.get("location_or_link") ?? "").trim();
  const location_or_link = loc_raw.length > 0 ? loc_raw : null;
  const instRaw = String(formData.get("institution_id") ?? "").trim();
  const institution_id = instRaw === "" || instRaw === "platform" ? null : instRaw;
  return { title, description, start_time, end_time, location_or_link, institution_id };
}

export async function createEventAction(formData: FormData): Promise<ActionResult> {
  const input = getEventInput(formData);
  const parsed = eventSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  const { error } = await supabase.from("events").insert({
    title: parsed.data.title,
    description: parsed.data.description,
    start_time: parsed.data.start_time,
    end_time: parsed.data.end_time || null,
    location_or_link: parsed.data.location_or_link || null,
    institution_id: parsed.data.institution_id,
    created_by: user.id,
  });
  if (error) return { error: error.message };

  revalidatePath("/events");
  redirect("/events");
}

export async function rsvpToggleAction(eventId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Please sign in." };

  const { data: existing } = await supabase
    .from("event_rsvps")
    .select("id")
    .eq("event_id", eventId)
    .eq("profile_id", user.id)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("event_rsvps")
      .delete()
      .eq("id", existing.id);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase
      .from("event_rsvps")
      .insert({ event_id: eventId, profile_id: user.id, rsvp_status: "going" });
    if (error) return { error: error.message };
  }

  revalidatePath(`/events`);
  revalidatePath(`/events/${eventId}`);
  return {};
}