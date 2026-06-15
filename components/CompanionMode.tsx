"use client";

import { useState } from "react";
import type { RouteOption } from "@/lib/types";
import { formatDuration } from "@/lib/geo";
import { ShareIcon, AlertIcon, ShieldIcon, PinIcon } from "./icons";

/** Format any input into a clean Indian mobile: +91 XXXXX XXXXX. */
function formatIndianPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "").replace(/^91/, "").slice(0, 10);
  const a = digits.slice(0, 5);
  const b = digits.slice(5, 10);
  return `+91 ${a}${b ? ` ${b}` : ""}`.trimEnd();
}

export function CompanionMode({
  option,
  active,
  progress,
  deviation,
  onToggle,
  onSimulateDeviation,
}: {
  option: RouteOption;
  active: boolean;
  progress: number;
  deviation: boolean;
  onToggle: () => void;
  onSimulateDeviation: () => void;
}) {
  const [contact, setContact] = useState("Amma");
  const [phone, setPhone] = useState("+91 98765 43210");

  const remaining = formatDuration(option.totalTimeMin * (1 - progress));
  const tripId = option.id.slice(0, 6).replace(/[^a-z0-9]/gi, "").toLowerCase() || "trip01";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy/5 text-navy">
            <ShieldIcon className="w-4 h-4" />
          </span>
          <div>
            <h3 className="text-sm font-semibold text-navy">Companion Mode</h3>
            <p className="text-[11px] text-muted">Share your live trip with someone you trust.</p>
          </div>
        </div>
        <span
          className={`h-2.5 w-2.5 rounded-full ${active ? "bg-teal animate-pulse" : "bg-slate-300"}`}
          aria-hidden
        />
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-[11px] font-medium text-muted">Trusted contact</span>
          <input
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-2.5 py-2 text-sm outline-none focus:border-brand"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-[11px] font-medium text-muted">Phone</span>
          <input
            value={phone}
            inputMode="numeric"
            onChange={(e) => setPhone(formatIndianPhone(e.target.value))}
            className="w-full rounded-lg border border-slate-200 px-2.5 py-2 text-sm outline-none focus:border-brand"
          />
        </label>
      </div>

      <button
        onClick={onToggle}
        className={`mt-3 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition ${
          active ? "bg-slate-100 text-ink hover:bg-slate-200" : "bg-teal text-white hover:bg-teal/90"
        }`}
      >
        <ShareIcon className="w-4 h-4" />
        {active ? "Stop sharing" : "Start sharing trip"}
      </button>

      {active && (
        <div className="mt-3 space-y-3">
          <div className="rounded-xl bg-slate-50 p-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted">Live link sent to {contact}</span>
              <span className="font-medium text-brand">sahayatri.app/t/{tripId}</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
              <div className="h-full rounded-full bg-teal transition-all" style={{ width: `${Math.round(progress * 100)}%` }} />
            </div>
            <div className="mt-1.5 flex items-center justify-between text-muted">
              <span className="flex items-center gap-1">
                <PinIcon className="w-3.5 h-3.5" /> {Math.round(progress * 100)}% of route
              </span>
              <span>ETA {remaining}</span>
            </div>
          </div>

          <button
            onClick={onSimulateDeviation}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-amber-300 bg-amber-50 py-2 text-xs font-semibold text-amber-700 transition hover:bg-amber-100"
          >
            <AlertIcon className="w-4 h-4" />
            Simulate off-route deviation
          </button>

          {deviation && (
            <div className="flex items-start gap-2 rounded-lg border border-red-300 bg-red-50 p-3 text-xs text-red-700">
              <AlertIcon className="mt-0.5 w-4 h-4 shrink-0" />
              <span>
                Route deviation detected near {option.legs[0]?.toStop.name}. Alert and live location
                sent to {contact} ({phone}).
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
