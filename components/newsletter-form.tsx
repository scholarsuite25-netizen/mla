"use client";

import { useState } from "react";
import { Check, Loader2, ArrowRight } from "lucide-react";

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
      setEmail("");
    } else {
      setState("error");
      setMessage(json.error ?? "Something went wrong.");
    }
  }

  return (
    <div className="mt-4 max-w-sm">
      <form onSubmit={submit} className="flex gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your.email@school.edu.ng"
          className="w-full rounded-lg border border-white/15 bg-black/40 px-3.5 py-2.5 text-xs text-parchment placeholder:text-parchment/40 focus:border-gold focus:outline-none transition-colors"
        />
        <button
          type="submit"
          disabled={state === "loading"}
          className="shrink-0 inline-flex items-center gap-1 rounded-lg bg-gold px-4 py-2.5 text-xs font-semibold text-ink hover:bg-gold-light transition-all disabled:opacity-60 shadow-sm"
        >
          {state === "loading" ? (
            <Loader2 size={14} className="animate-spin" />
          ) : state === "done" ? (
            <Check size={14} />
          ) : (
            <>
              <span>Join</span>
              <ArrowRight size={12} />
            </>
          )}
        </button>
      </form>
      {message && (
        <p className={`mt-2 text-xs font-medium ${state === "error" ? "text-red-400" : "text-gold"}`}>
          {message}
        </p>
      )}
    </div>
  );
}