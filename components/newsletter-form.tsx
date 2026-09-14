"use client";

import { useState } from "react";
import { Check, Loader2 } from "lucide-react";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    setMessage("");
    const res = await fetch("/api/newsletter", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const json = await res.json().catch(() => ({}));
    if (res.ok) {
      setState("done");
      setMessage(json.message ?? "You're on the list. Welcome!");
    } else {
      setState("error");
      setMessage(json.error ?? "Something went wrong.");
    }
  }

  return (
    <form onSubmit={submit} className="mt-4 flex max-w-sm gap-2">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@school.edu.ng"
        className="w-full rounded-sm border border-parchment/20 bg-ink px-3 py-2 text-sm text-parchment placeholder:text-parchment/40 focus:border-gold focus:outline-none"
      />
      <button
        type="submit"
        disabled={state === "loading"}
        className="shrink-0 rounded-sm bg-gold px-4 py-2 text-sm font-medium text-ink hover:bg-gold/90 disabled:opacity-60"
      >
        {state === "loading" ? <Loader2 size={16} className="animate-spin" /> : state === "done" ? <Check size={16} /> : "Join"}
      </button>
      {message && (
        <p className={`text-sm ${state === "error" ? "text-crest-red" : "text-gold"}`}>
          {message}
        </p>
      )}
    </form>
  );
}