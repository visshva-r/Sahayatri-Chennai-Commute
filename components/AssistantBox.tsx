"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { SparkleIcon } from "./icons";

const EXAMPLES = [
  "Cheapest safe way from Guindy to Anna Nagar after 9pm",
  "Fastest from Airport to Central",
  "Comfortable ride from Velachery to T Nagar",
];

export function AssistantBox({
  tone = "dark",
  compact = false,
  onNavigate,
}: {
  tone?: "dark" | "light";
  compact?: boolean;
  onNavigate?: () => void;
}) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dark = tone === "dark";

  const run = async (text: string) => {
    const query = text.trim();
    if (!query || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const j = await res.json();
      if (!res.ok || !j.understood) {
        setError("I couldn't catch both stops. Try an example, or use the planner.");
        setLoading(false);
        return;
      }
      router.push(
        `/results?from=${j.fromId}&to=${j.toId}&priority=${j.priority}&tod=${j.timeOfDay}&q=${encodeURIComponent(query)}`,
      );
      setLoading(false);
      onNavigate?.();
    } catch {
      setError("Something went wrong. Use the planner instead.");
      setLoading(false);
    }
  };

  return (
    <div
      className={
        dark
          ? "rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur"
          : "rounded-2xl border border-slate-200 bg-white p-4 shadow-card"
      }
    >
      <div className={`mb-2 flex items-center gap-2 text-sm font-medium ${dark ? "text-white" : "text-navy"}`}>
        <SparkleIcon className="w-4 h-4 text-teal" />
        Ask in plain language
        <span className="rounded-full bg-teal/20 px-2 py-0.5 text-[10px] font-semibold text-teal">AI</span>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          run(q);
        }}
        className="flex gap-2"
      >
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Cheapest safe way from Guindy to Anna Nagar after 9pm"
          className={
            dark
              ? "min-w-0 flex-1 rounded-lg border border-white/20 bg-white/95 px-3 py-2.5 text-sm text-ink outline-none placeholder:text-muted/70 focus:ring-2 focus:ring-teal/40"
              : "min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-ink outline-none placeholder:text-muted/70 focus:ring-2 focus:ring-teal/40"
          }
        />
        <button
          type="submit"
          disabled={loading}
          className="shrink-0 rounded-lg bg-teal px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal/90 disabled:opacity-60"
        >
          {loading ? "Planning..." : "Plan"}
        </button>
      </form>
      {!compact && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => {
                setQ(ex);
                run(ex);
              }}
              className={
                dark
                  ? "rounded-full border border-white/20 px-2.5 py-1 text-[11px] text-white/80 transition hover:bg-white/10"
                  : "rounded-full border border-slate-200 px-2.5 py-1 text-[11px] text-muted transition hover:bg-slate-50"
              }
            >
              {ex}
            </button>
          ))}
        </div>
      )}
      {error && <p className={`mt-2 text-xs ${dark ? "text-amber-300" : "text-amber-600"}`}>{error}</p>}
    </div>
  );
}
