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
          className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs text-white placeholder:text-white/40 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-all"
        />
        <button
          type="submit"
          disabled={state === "loading"}
          className="shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-[#00D2FF] px-4 py-2.5 text-xs font-bold text-[#0A0E2A] hover:bg-[#38BDF8] transition-all disabled:opacity-60 shadow-md shadow-cyan-500/20 cursor-pointer"
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
        <p className={`mt-2 text-xs font-medium ${state === "error" ? "text-red-400" : "text-[#00D2FF]"}`}>
          {message}
        </p>
      )}
    </div>
  );
}