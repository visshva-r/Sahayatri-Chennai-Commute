"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { SELECTABLE_STOPS } from "@/lib/data/chennai";
import type { Priority, TimeOfDay } from "@/lib/types";
import { ShieldIcon, ClockIcon, RupeeIcon, TransferIcon, ComfortIcon } from "./icons";

const PRIORITIES: { id: Priority; label: string; icon: React.ReactNode }[] = [
  { id: "fastest", label: "Fastest", icon: <ClockIcon className="w-4 h-4" /> },
  { id: "cheapest", label: "Cheapest", icon: <RupeeIcon className="w-4 h-4" /> },
  { id: "comfortable", label: "Comfort", icon: <ComfortIcon className="w-4 h-4" /> },
  { id: "safest", label: "Safest", icon: <ShieldIcon className="w-4 h-4" /> },
];

const TIMES: { id: TimeOfDay; label: string }[] = [
  { id: "day", label: "Day" },
  { id: "evening", label: "Evening" },
  { id: "night", label: "Night" },
];

export function JourneyForm({
  compact = false,
  initial,
  onNavigate,
}: {
  compact?: boolean;
  initial?: { from?: string; to?: string; priority?: Priority; tod?: TimeOfDay };
  onNavigate?: () => void;
}) {
  const router = useRouter();
  const [from, setFrom] = useState(initial?.from ?? "guindy");
  const [to, setTo] = useState(initial?.to ?? "annanagar_east");
  const [priority, setPriority] = useState<Priority>(initial?.priority ?? "fastest");
  const [tod, setTod] = useState<TimeOfDay>(initial?.tod ?? "day");
  const [error, setError] = useState<string | null>(null);

  const swap = () => {
    setFrom(to);
    setTo(from);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (from === to) {
      setError("Pick two different stops.");
      return;
    }
    setError(null);
    router.push(`/results?from=${from}&to=${to}&priority=${priority}&tod=${tod}`);
    onNavigate?.();
  };

  return (
    <form
      onSubmit={submit}
      className={`rounded-2xl border border-slate-200 bg-white p-4 shadow-card sm:p-5 ${compact ? "" : "sm:p-6"}`}
    >
      <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-end">
        <Field label="From">
          <StopSelect value={from} onChange={setFrom} />
        </Field>
        <button
          type="button"
          onClick={swap}
          className="mb-1 mx-auto flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-muted transition hover:bg-slate-50 hover:text-brand"
          aria-label="Swap origin and destination"
        >
          <TransferIcon className="w-5 h-5" />
        </button>
        <Field label="To">
          <StopSelect value={to} onChange={setTo} />
        </Field>
      </div>

      <div className="mt-4 space-y-4">
        <div>
          <p className="mb-1.5 text-xs font-medium text-muted">Optimise for</p>
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
            {PRIORITIES.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPriority(p.id)}
                className={`flex min-w-0 items-center justify-center gap-1 whitespace-nowrap rounded-lg border px-1.5 py-2 text-[13px] font-medium transition ${
                  priority === p.id
                    ? "border-brand bg-brand text-white"
                    : "border-slate-200 bg-white text-ink hover:border-brand/40"
                }`}
              >
                <span className="shrink-0">{p.icon}</span>
                {p.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-1.5 text-xs font-medium text-muted">Time of day</p>
          <div className="flex gap-1.5">
            {TIMES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTod(t.id)}
                className={`flex-1 rounded-lg border px-2 py-2 text-sm font-medium transition ${
                  tod === t.id
                    ? "border-navy bg-navy text-white"
                    : "border-slate-200 bg-white text-ink hover:border-navy/40"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        className="mt-4 w-full rounded-xl bg-navy py-3 text-sm font-semibold text-white transition hover:bg-navy/90"
      >
        Plan my journey
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-muted">{label}</span>
      {children}
    </label>
  );
}

function StopSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-ink outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
    >
      {SELECTABLE_STOPS.map((s) => (
        <option key={s.id} value={s.id}>
          {s.name}
        </option>
      ))}
    </select>
  );
}
