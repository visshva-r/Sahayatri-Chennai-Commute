"use client";

import { useState } from "react";
import type { RouteOption, TimeOfDay } from "@/lib/types";
import { explainWhy, factorCards } from "@/lib/explain";
import { TIME_NOTE } from "@/lib/safety";
import { ScoreRing, bandColor } from "./SafetyMeter";
import { InfoIcon } from "./icons";

const VERDICT_TONE = {
  strong: "bg-teal/10 text-teal border-teal/30",
  ok: "bg-amber-50 text-amber-700 border-amber-200",
  weak: "bg-red-50 text-red-600 border-red-200",
};

export function SafetyExplain({ option, timeOfDay }: { option: RouteOption; timeOfDay: TimeOfDay }) {
  const [open, setOpen] = useState(false);
  const why = explainWhy(option, timeOfDay);
  const cards = factorCards(option);
  const c = bandColor(option.safetyBand);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
      <div className="mb-3 flex items-start gap-3">
        <ScoreRing score={option.safetyScore} band={option.safetyBand} size={64} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h3 className="text-sm font-semibold text-navy">Safe-Route Score</h3>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="flex h-5 w-5 items-center justify-center rounded-full text-muted transition hover:bg-slate-100 hover:text-navy"
              aria-label="How the Safe-Route Score is calculated"
            >
              <InfoIcon className="h-4 w-4" />
            </button>
          </div>
          <span className={`mt-1 inline-block rounded-full border px-2 py-0.5 text-[11px] font-semibold ${c.bg} ${c.text} ${c.border}`}>
            {option.safetyBand}
          </span>
          <p className="mt-2 text-xs leading-relaxed text-ink">{why.headline}</p>
        </div>
      </div>

      {open && (
        <p className="mb-3 rounded-lg bg-slate-50 px-3 py-2 text-[11px] leading-relaxed text-muted">{why.formula}</p>
      )}

      <ul className="mb-3 space-y-1.5 text-xs text-ink">
        {why.bullets.map((b) => (
          <li key={b} className="rounded-lg bg-slate-50 px-3 py-2 leading-relaxed">
            {b}
          </li>
        ))}
      </ul>

      <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-muted">Factor cards</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {cards.map((f) => (
          <article key={f.key} className="rounded-xl border border-slate-200 p-3">
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs font-semibold text-navy">{f.label}</p>
              <span className={`shrink-0 rounded-full border px-1.5 py-0.5 text-[10px] font-semibold ${VERDICT_TONE[f.verdict]}`}>
                {f.weightPct}%
              </span>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200">
                <div
                  className={`h-full rounded-full ${
                    f.verdict === "strong" ? "bg-teal" : f.verdict === "ok" ? "bg-amber-500" : "bg-red-500"
                  }`}
                  style={{ width: `${f.score}%` }}
                />
              </div>
              <span className="w-7 text-right text-xs font-semibold text-ink">{f.score}</span>
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-ink">{f.evidence}</p>
            {open && <p className="mt-1 text-[11px] text-muted">{f.why}</p>}
          </article>
        ))}
      </div>
      <p className="mt-3 text-[11px] text-muted">
        Mode exposure {Math.round(option.breakdown.modeFactor * 100)}% · {TIME_NOTE[timeOfDay]}
      </p>
    </div>
  );
}
